const {Schema, model} = require("mongoose");

const userSchema = new Schema({
  test: String
});

const Test = model("Test", userSchema);

module.exports = Test;