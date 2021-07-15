const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jsQR = require("jsqr");
const Jimp = require('jimp');
const Donation = require('../models/donationModel');
const { differenceInDays } = require('date-fns');

class Processes {
  constructor(Model) {
    this.Model = Model;
  }
  
  
  processDonation() {
    return catchAsync(async (req, res, next) => {
      // Check if date is greater than the minimum number of days necessary
      // to process the pick-up or drop-off donation
      const dateFromDonor = new Date(req.body.pickupDate);
      const dateNow = new Date();
      const DONATION_PROCESS_TIME = 3; // Can be any number >= 1
      
      if (differenceInDays(dateFromDonor, dateNow) < DONATION_PROCESS_TIME) {
        dateNow.setDate(dateNow.getDate() + DONATION_PROCESS_TIME);

        return next(new AppError(`Please select a date after ${dateNow.toLocaleDateString()}`))
      }
      
      // Loop through & format for saving in database
      req.body.items = req.body.description.map((description, index) => {
        return {
          description,
          metric: req.body.metric[index],
          quantity: req.body.quantity[index]
        }
      }).filter(item => item.description !== undefined && item.quantity > 0);

      // delete req.body.donationFrequency;
      delete req.body.quantity;
      delete req.body.metric;
      delete req.body.description;
      
      req.body.user = req.user._id.toString();
      // console.log(req.body);
      const donation = await Donation.create(req.body);
      
      res.status(201).json({ status: 'success', donation });
    });
  }
  
  loggedInUserDonation() {
    return catchAsync(async (req, res, next) => {
      const {_id} = req.user;
      
      // find logged in user donation
      const donation = await this.Model.find({user: _id})
        .populate({path: "rider"})
        .populate({path: "user"});
      
      // send response to the user
      res.status(201).json({
        status: "success",
        length: donation.length,
        donation
      });
    });
  }
  
  updateDispatchRiders() {
    return catchAsync(async (req, res, next) => {
      const {donationId, riderId} = req.query;
      
      if(!donationId || !riderId) {
        return next(new AppError("provide the donationId and riderId", 400));
      }
      
      const donation = await this.Model.findByIdAndUpdate(donationId, {
        rider: riderId,
        attachedDispatchRider: true
      }, {
        new: true,
        runValidator: true
      })
      .populate({path: "rider"})
      .populate({path: "user"});
    
      res.status(200).json({
        status: "success",
        donation
      });
    });
  }
  
  changeStatus() {
    return catchAsync(async (req, res, next) => {
      const {donationId, decodedData} = req.query;
      
      if(!donationId || !decodedData) {
        return next(new AppError("provide your donationId or decodedData", 400));
      }
      
      // Find the associated donation
      const donation = await this.Model.findOne({_id:donationId});
      
      // Decode the qrcode on this donation document
      const image = await Jimp.read(donation.qrCodeLink);
      const value = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height);
      //console.log(value);
      
      // Decode the qrcode scan by the dispatch rider
      
      // compare both the stored data
      if(value.data !== decodedData) {
        return next(new AppError("incorrect", 400));
      }
      
      // update the status to picked-up
      const updateDonation = await this.Model.findByIdAndUpdate(donationId, {
        status: "picked-up"
      }, {
        new: true,
        runValidator: true
      })
      .populate({path: "rider"})
      .populate({path: "user"});
      
      // send response to the user
      res.status(201).json({
        status: "success",
        donation: updateDonation
      });
    });
  }
  
}

module.exports = Processes;