const Test = require("../models/testModel");
const CRUDAPI = require("./CRUD");
const api = new CRUDAPI(Test);

exports.createTest = api.createData();
exports.getAllTest = api.getAllData();