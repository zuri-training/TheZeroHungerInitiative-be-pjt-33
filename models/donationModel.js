const {Schema, model} = require("mongoose");
const QRCode = require('qrcode');
const {cloudinary} = require("../utils/cloudinary.js");

const itemsSchema = new Schema({
  description: String,
  quantity: Number,
  metric: String
});

const donationSchema = new Schema({
  foodCategory: {
    type: String,
    required: [true, "Please provide your food category"],
    enum: ["cooked food", "raw food"]
  },
  items: [itemsSchema],
  deliveryOption: {
    type: String,
    required: [true, "Please provide your delivery option"],
    enum: ["pick-up", "drop-off"]
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "picked-up", "delivered"]
  },
  user: {
    type: Schema.ObjectId,
    ref: "User"
  },
  pickupDate: {
    type: Date,
    required: [true, "please provide your pickup date"]
  },
  pickupAddress: {
    type: String,
    required: [true, "please provide your pickup address"]
  },
  contactName: {
    type: String,
    required: [true, "please provide your contact name"]
  },
  contactPhoneNumber: {
    type: Number,
    required: [true, "please provide your contact name"]
  },
  localGovernment: {
    type: String,
    required: [true, "please provide your local government"]
  },
  attachedDispatchRider: {
    type: Boolean,
    default: false
  },
  rider: {
    type: Schema.ObjectId,
    ref: "User"
  },
  qrCodeLink: {
    type: String
    //select: false
  }
}, {
  timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"}
});

donationSchema.pre("save", async function(next) {
  if(this.isModified("qrCodeLink")) return next();
  // this.isNew
  // 1. generate the qrCode
  //const code = await QRCode.toString(`${this._id}`);
  const code = await QRCode.toDataURL(`${this._id}`);
  
  const uploadResponse = await cloudinary.uploader.upload(code);
  
  this.qrCodeLink = uploadResponse.secure_url;
  next();
});


const Donation = model("Donation", donationSchema);

module.exports = Donation;