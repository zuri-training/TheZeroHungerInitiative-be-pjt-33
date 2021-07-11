const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const uaParser = require('ua-parser-js');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

class AuthController {
  constructor(User) {
    this.User = User;
  }

  updateBadge() {
    return catchAsync(async (req, res, next) => {
      const { badge, username } = req.body;
      const user = await this.User.findOne({ username });

      if (!user)
        return next(new AppError('No user found with that username', 404));

      await this.User.findByIdAndUpdate(
        user._id,
        { badge },
        {
          runValidator: true,
          new: true,
        }
      );

      res.status(200).json({
        status: 'success',
        message: 'User badge successfully updated!',
      });
    });
  }

  sendToken({ _id }, res) {
    // Generating jwt token
    const token = jwt.sign({ _id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Creating an httpOnly cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    // Sending cookie
    res.cookie('token', token, cookieOptions);

    return token;
  }

  signup() {
    return catchAsync(async (req, res, next) => {
      if (req.body.role === 'admin') {
        return next(
          new AppError("Hey, you can't make your self an admin 😎", 400)
        );
      }

      // save user to database & generate a token
      const user = await this.User.create(req.body);
      const token = this.sendToken(user, res);
      
      // removing the user password from the output
      user.password = undefined;

      const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // send a response
      res.status(201).json({
        status: 'success',
        user,
        token,
        iat: decode.iat,
        exp: decode.exp,
      });
    });
  }

  login() {
    return catchAsync(async (req, res, next) => {
      const { email, password } = req.body;

      // 1) Check is the user provide and email and password
      if (!email || !password) {
        return next(new AppError('Please enter your email and password!'), 401);
      }

      // 2) check if the user email exists in the database and confirm the password
      const userExist = await User.findOne({ email }).select('+password');
      if (!userExist) return next(new AppError('Invalid credentials!', 401));

      // does password correct
      const correct = await userExist.correctPassword(
        password,
        userExist.password
      );

      // error message if no user exist and incorrect password
      if (!correct) return next(new AppError('Invalid credentials!', 401));

      // generate token
      const token = this.sendToken(userExist, res);
      const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      res.status(200).json({
        status: 'success',
        user: userExist,
        token,
        iat: decode.iat,
        exp: decode.exp,
      });
    });
  }

  logout() {
    return (req, res, next) => {
      res
        .cookie('token', 'none', {
          expires: new Date(Date.now()),
          httpOnly: true,
        })
        .status(200)
        .json({ status: 'success' });
    };
  }

  authenticate() {
    return catchAsync(async (req, res, next) => {
      let token;

      // 1= Check if the token is in the header OR Check it in the request token
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.token) {
        token = req.cookies.token;
      }

      // No token, send error message
      if (!token)
        return next(new AppError('Unauthorized. Please log in!', 401));

      // 2= Verification of token
      /*
        1= Using the promisify method so as to avoid passing callback to the jwt.verify method
      */
      const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      // 3= Check if the user exist in the database
      const userExist = await User.findById(decode._id);

      // Checking for the existence of the user that owns the token
      if (!userExist)
        return next(new AppError('Unauthorized. Please log in!', 401));

      // GRANT ACCESS TO PROTECTED ROUTE
      req.user = userExist;
      next();
    });
  }

  authenticateApp() {
    // Basically a modification of the authenticate() method above.
    // Shows non-API error messages on the FrontEnd
    return catchAsync(async (req, res, next) => {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.token) {
        token = req.cookies.token;
      }

      // No token, send error message
      if (!token) {
        req.flash('errorMessage', 'Unauthorized. Please log in!');
        return res.redirect('/login');
      }

      const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const userExist = await User.findById(decode._id);

      if (!userExist) {
        req.flash('errorMessage', 'Unauthorized. Please log in!');
        return res.redirect('/login');
      }

      req.user = userExist;
      //res.locals.user = userExist;
      next();
    });
  }
  
  isLoggedIn() {
    // Basically a modification of the authenticate() method above.
    // Determine if a user is logged in
    return catchAsync(async (req, res, next) => {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.token) {
        token = req.cookies.token;
      }

      // No token, send error message
      if (!token) {
        return next();
      }

      const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const userExist = await User.findById(decode._id);

      if (!userExist) {
        return next();
      }

      req.user = userExist;
      //res.locals.user = userExist;
      next();
    });
  }

  /**
   * If the array of roles we provided doesn't include the currently logged in user,
   * then don't grant them access
   * @param  {...any} roles Array of user roles
   */
  authorize(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError('Unauthorised to access this resource', 403));
      }

      next();
    };
  }

  authorizeApp(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        req.flash('errorMessage', 'Unauthorized to access this URL. Please log in!');
        return res.status(403).redirect('/login');
      }

      next();
    }
  }

  forgotPassword() {
    return catchAsync(async (req, res, next) => {
      const { email } = req.body;

      if (!email) {
        return next(new AppError('Please enter your email', 400));
      }
      // 1. check if the provided email exist in the database
      const user = await this.User.findOne({ email });

      if (!user) {
        return next(
          new AppError(`Account with email address doesn't exist`, 404)
        );
      }

      // 2. generate a random token for the user
      const resetToken = user.passwordResetTokenMethod();
      user.save({ validateBeforeSave: false });

      // Generating reset URL
      let resetURL;
      const ua = uaParser(req.headers['user-agent']);

      if (process.env.NODE_ENV === 'production') {
        resetURL = `${req.protocol}://${req.get(
          'host'
        )}/reset-password?token=${resetToken}`;
      } else {
        resetURL = `${req.protocol}://${req.get(
          'host'
        )}/api/v1/users/reset-password/${resetToken}`;
      }

      // 3. send the link to the user email
      try {
        await sendEmail({
          email: user.email,
          subject: `Reset Your Password ~ ${process.env.FROM_NAME}`,
          template: 'mail/passwordResetMail',
          context: {
            userName: user.username,
            os: `${ua.os.name} ${ua.os.version}`,
            browser: `${ua.browser.name}`,
            resetURL,
            passwordExpiration: '20 minutes',
            productName: process.env.FROM_NAME,
          },
        });

        return res
          .status(200)
          .json({ status: 'success', message: 'Password reset email sent' });
      } catch (e) {
        logger.debug(e);
        return next(
          new AppError(`Password reset email couldn't been sent at the moment`)
        );
      }
    });
  }

  resetPassword() {
    return catchAsync(async (req, res, next) => {
      const { resetToken } = req.params;
      const { password, passwordConfirm } = req.body;

      // Hashing the retrieve resetToken from params
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // check if user with the hash token exist and the expires time has not passed.
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) return next(new AppError('Token expired or invalid', 400));

      if (!password || !passwordConfirm)
        return next(new AppError('Please enter your new password twice', 400));

      if (password !== passwordConfirm)
        return next(new AppError(`Your passwords don't match`, 400));

      // Resetting user password
      user.password = password;
      user.passwordConfirm = passwordConfirm;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      // sign token and send response
      const token = this.sendToken(user, res);

      res.status(200).json({
        status: 'success',
        token,
      });
    });
  }

  updatePassword() {
    return catchAsync(async (req, res, next) => {
      const { currentPassword, password, passwordConfirm } = req.body;

      if (!currentPassword || !password || !passwordConfirm) {
        return next(new AppError('provide, all the required fields'));
      }

      // 1) Get the user
      const user = await User.findById(req.user.id).select('+password');

      // 2)  check for the correct password
      if (!(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError('Incorrect current password', 401));
      }

      // 3) Update the password
      user.password = password;
      user.passwordConfirm = passwordConfirm;
      await user.save();

      // 4) sign token and send response
      const token = this.sendToken(user, res);

      res.status(200).json({ status: 'success', token });
    });
  }
}

module.exports = new AuthController(User);