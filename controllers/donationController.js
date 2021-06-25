const CRUDAPI = require("./CRUD");
const Processes = require("./Processes");
const Donation = require("../models/donationModel");

const api = new CRUDAPI(Donation);
const process = new Processes(Donation);

exports.createDonation = process.processDonation();

exports.myDonation = process.loggedInUserDonation();

exports.attachDispatchRiders = process.updateDispatchRiders();

exports.verifyPickedUp = process.changeStatus();

exports.updateDonation = api.updateData();

exports.getAllDonation = api.getAllData();

exports.getDonation = api.getData();

exports.deleteDonation = api.deleteData();