const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jsQR = require("jsqr");
const Jimp = require('jimp');
const Donation = require('../models/donationModel');

class Processes {
  constructor(Model) {
    this.Model = Model;
  }
  
  
  processDonation() {
    return catchAsync(async (req, res, next) => {
      // save the donation to the database
      // Loop through & format for saving in database
      delete req.body.donationFrequency;
      delete req.body.quantity;
      delete req.body.metric;
      delete req.body.description;

      req.body.user = req.user._id.toString();
      // console.log(req.body);
      const donation = await Donation.create(req.body);
      /*const donation = await query.populate({path: "rider"})
        .populate({path: "user"});*/
      
      // send response to the user
      res.status(201).json({ status: "success", donation });
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