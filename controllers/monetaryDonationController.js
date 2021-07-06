const User = require('../models/userModel');
const MonetaryDonation = require('../models/monetaryDonationModel');
const request = require('request');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { initializePayment, verifyPayment } = require('../utils/paystack')(request);


exports.createMonetaryDonation = catchAsync (async (req, res, next) => {
  const { donorName, amount } = req.body;
  const email = req.user.email;

  await new MonetaryDonation({
    email, donorName, amount, user: req.user._id
  }).validate()

  initializePayment(JSON.stringify({
    email,
    amount: amount * 100, // Convert the amount to kobo
    metadata: { donorName, donorId: req.user._id }
  }), async (error, body) => {
    if (error) {
      return next(new AppError('An error occured during payment initialisation', 500));
    }

    res.status(200).json({ status: 'success', data: JSON.parse(body) });
  })
})


exports.verifyMonetaryDonation = catchAsync(async (req, res, next) => {
  const ref = req.params.reference;

  verifyPayment(ref, async (error,body) => {
    if (error) {
      return next(new AppError('An error occured during payment verification', 500));
    }

    const response = JSON.parse(body);
    if (response.status === false) return next(new AppError(response.message, 400));

    const { data } = response;
    const { donorName, donorId } = data.metadata;
    const [status, email, referenceId, amount] = [data.status, data.customer.email, data.reference, data.amount / 100];

    let transaction;
    const transactionExists = await MonetaryDonation.findOne({ referenceId });

    if (!transactionExists) {
      transaction = await MonetaryDonation.create({
        email, donorName, referenceId, amount, user: donorId, transactionStatus: status
      })
    } else transaction = transactionExists;
    
    if (transaction.transactionStatus !== status) {
      transaction.transactionStatus = status;
      await transaction.save();
    }

    if (status === 'abandoned') {
      return next(new AppError('Payment unsuccessful. Please try donating again', 400));
    } else if (status === 'success') {
      return res.status(200).json({ status: 'success', message: `Payment successful! You've donated ₦${amount} to The Hunger Initiative` });
    }

    res.status(500).json({ status: 'false', message: 'An unknown error occured!' });
  })
})