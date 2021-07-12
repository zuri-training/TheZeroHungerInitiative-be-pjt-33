const User = require('../models/userModel');
const Donation = require('../models/donationModel');
const MonetaryDonation = require('../models/monetaryDonationModel');
const Message = require('../models/messageModel');


exports.fetchAdminDonations = async () => {
  const foodDonations = await Donation.find();
  const cashDonations = await MonetaryDonation.find();

  return {
    foodDonations,
    cashDonations
  }
}

exports.fetchAdminDashboard = async () => {
  const latestUsers = await User.find().sort({ createdAt: -1 }).limit(4).lean();
  const userCount = await User.countDocuments();
  const foodDonationCount = await Donation.countDocuments();
  const cashDonationCount = await MonetaryDonation.countDocuments();
  const pendingChat = await Message.find({ unread: true });

  return {
    latestUsers,
    userCount,
    foodDonationCount,
    cashDonationCount,
    pendingChat
  }
}