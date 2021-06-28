const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Email = require("../utils/Email");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");


class AuthController {
  constructor(User) {
    this.User = User;
  }
  
  updateBadge() {
    return catchAsync(async (req, res, next) => {
      const {badge, username} = req.body;
      
      const user = await this.User.findOne({username});
      
      if(!user) {
        return next(new AppError("No user found with that username", 404));
      }
      
      const updateUser = await this.User.findByIdAndUpdate(user._id, {badge}, {
        runValidator: true,
        new: true
      });
      
      res.status(200).json({
        status: "success",
        message: "user badge successful updated"
      });
    });
  }
  
  sendToken({_id}, res) {
    // Generating jwt token
    const token =  jwt.sign({ _id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    // Creating an httpOnly cookie 
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true
    };
    
    // Sending cookie
    res.cookie("token", token, cookieOptions);
    
    return token;
  }
  
  signup() {
    return catchAsync(async (req, res, next) => {
      
      if(req.body.role === "admin") {
        return(next(new AppError("Hey, you can't make your self admin 😎", 400)));
      }
      
      // save user to database
      const user = await this.User.create(req.body);
 
      // generate a token
      const token =  this.sendToken(user, res);
      
      // removing the user password from the output
      user.password = undefined;
      
      const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      
      // send a response
      res.status(201).json({
        status: "success",
        user,
        token,
        iat: decode.iat,
        exp: decode.exp
      });
    });
  }
  
  login() {
    return catchAsync(async (req, res, next) => {
      const { username, password } = req.body;
  
      // 1) Check is the user provide and email and password
      if(!username || !password) {
        return next(new AppError("Please provide username and password!"), 401);
      }
  
      // 2) check if the user email exists in the database and cofirm the password
      const userExist = await User.findOne({ username }).select("+password");
      
      // does password correct
      const correct = await userExist.correctPassword(password, userExist.password);
      
      // error message if no user exist and incorrect password
      if(!userExist || !correct) {
        return next(new AppError("Incorrect username or password!", 401));
      }
      
      // generate token
      const token = this.sendToken(userExist, res);
      
      const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      
      res.status(200).json({
        status: "success",
        user: userExist,
        token,
        iat: decode.iat,
        exp: decode.exp
      });
    });
  }
  
  authenticate() {
    return catchAsync(async (req, res, next) => {
      let token;
      
      // 1= Check if the token is in the header OR Check it in the request token
      if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      } else if(req.cookies.token) {
        token = req.cookies.token;
      }
      
      // No token, send error message
      if(!token) {
        return next(new AppError("Unauthorized, logged in again!!!", 401));
      }
      
      // 2= Verification of token
      /*
        1= Using the promisify method so as to avoid passing callback to the jwt.verify method
      */
      const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      
      // 3= Check if the user exist in the database
      const userExist = await User.findById(decode._id);
      
      // Checking for the existence of the user that owns the token
      if(!userExist) {
        return next(new AppError("This user doesn't exist in the database anymore", 401));
      }
      
      // GRANT ACCESS TO PROCTECTED ROUTE
      req.user = userExist;
      next();
    });
  }
  /*
  @params:
    array of roles
    
    1= if the array of roles we provided doesn't include the currently logged in user, then don't grant them access. 
  */
  
  authorize(...roles) {
    return (req, res, next) => {
      if(!roles.includes(req.user.role)) return next(new AppError("You are not allowed to use this resource, please contact support!!!", 403));
      
      next();
    };
  };
  
  forgotPassword() {
    return catchAsync(async (req, res, next) => {
      const {email} = req.body;
      
      if(!email) {
        return next(new AppError("please provide your email", 400))
      }
      // 1. check if the provided email exist in the database
      const user = await this.User.findOne({email});
      
      if(!user) {
        return next(new AppError("the email doesn't match any records in the database", 404));
      }
      
      // 2. generate a random token for the user
      const resetToken = user.passwordResetTokenMethod();
      user.save({ validateBeforeSave: false });
  
      // 3. send the link to the user email
      try {
        // Generating reset link
        const resetLink = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
      
        // creating an instance of this class
        const sendEmail = new Email(user, resetLink);
      
        // sending the reset link to the user email
        await sendEmail.sendResetPasswordLink();
        
        return res.status(200).json({
          status: "success",
          message: "email sent"
        });
      
      // if paraventure an error occur, it might be possible the passwordResetToken, and passwordResetExpires might have already been set
      } catch (e) {
        // Reset to undefined
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        logger.debug(e);
        await user.save({ validateBeforeSave: false });
        logger.debug(e);
        return next(new AppError("There was an error sending email", 500));
      }
    });
  }
  
  resetPassword() {
    return catchAsync(async (req, res, next) => {
      const {resetToken} = req.params;
      const {password, passwordConfirm} = req.body;
     
      if(!password || !passwordConfirm) {
        return next(new AppError("provide your password and passwordConfirm", 400));
      }
      
      // Hashing the retrieve resetToken from params
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      
      // check if user with the hash token exist and the expires time has not passed.
      const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
      
      if(!user) {
        return (next(new AppError("Token expired or invalid", 400)));
      }
      
      // Resetting user password
      user.password = password;
      user.passwordConfirm = passwordConfirm;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({});
      
      // sign token and send response
      const token = this.sendToken(user, res);
      
      res.status(200).json({
        status: "success",
        token
      });
    });
  }
  
  updatePassword() {
    return catchAsync(async (req, res, next) => {
      const {currentPassword, password, passwordConfirm} = req.body;
      
      if(!currentPassword || !password || !passwordConfirm) {
        return next(new AppError("provide, all the required fields"));
      }
      
      // 1) Get the user
      const user = await User.findById(req.user.id).select("+password");
      
      // 2)  check for the correct password
      if(!(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError("Incorrect current password", 401));
      }
      
      // 3) Update the password
      user.password = password;
      user.passwordConfirm = passwordConfirm;
      await user.save();
      
      // 4) sign token and send response
     const token = this.sendToken(user, res);
     
     res.status(200).json({
       status: "success",
       token
     });
    });
  }
}

module.exports = new AuthController(User);