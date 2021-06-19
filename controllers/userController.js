const CRUDAPI = require("./CRUD");
const User = require("../models/userModel");
const api = new CRUDAPI(User);

exports.updateUser = api.updateData();
exports.getAllUser = api.getAllData();
exports.getUser = api.getData();
exports.deleteUser = api.deleteData();