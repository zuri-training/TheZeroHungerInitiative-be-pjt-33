const {Schema, model} = require("mongoose");
//validate: [validator.isEmail, "Please provide a valid email"] trim: true,
//timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"
// Preferred name, phone number, email, and password, and password confirm, isDisabled, createdAt, updatedAt, role
const userSchema = new Schema({
  test: String
});

const User = model("User", userSchema);

module.exports = User;