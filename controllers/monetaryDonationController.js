const User = require('../models/userModel');
const MonetaryDonation = require('../models/monetaryDonationModel');
const request = require('request');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { initializePayment, verifyPayment } = require('../utils/paystack')(request);


exports.createMonetaryDonation = catchAsync (async (req, res, next) => {
  const { donorName, amount } = req.body;
  const email = req.user.email;

  // const user = await User.findById(req.user._id, { email });
  // if (!user) return next(new AppError(`User with email address "${email}" does not exist`, 400));

  const monetaryDonation = await MonetaryDonation.create({
    email, donorName, amount, user: req.user._id
  })

  initializePayment(JSON.stringify({
    email,
    amount: amount * 100 // Convert the amount to kobo
  }), async (error, body) => {
    if (error) {
      console.log(error);
      return next(new AppError('An error occured during payment initialisation', 400));
    }

    response = JSON.parse(body);
    monetaryDonation.referenceId = response.data.reference;
    await monetaryDonation.save();

    res.status(200).json({ status: 'success', data: response.data});
  })
})


exports.verifyMonetaryDonation = catchAsync(async (req, res, next) => {

})