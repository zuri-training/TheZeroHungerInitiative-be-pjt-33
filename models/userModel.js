const {Schema, model} = require("mongoose");
const validator = require("validator");
//validate: [validator.isEmail, "Please provide a valid email"] trim: true,
//timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"
// Preferred name, phone number, email, and password, and password confirm, isDisabled, createdAt, updatedAt, role
const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Please provide your username"],
    lowercase: true
  },
  phoneNumber: {
    type: Number,
    required: [true, "Please provide your phone number"]
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "Please provide a valid email"],
    trim: true,
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["donor", "admin"],
    default: "donor"
  },
  isDisabled: {
    type: String,
    default: false
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide your passwordConfirm"],
    validate: {
      validator: function(val) {
        return this.password === val;
      },
      message: "Your password doesn't match"
    }
  }
}, {
  timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"}
});

// 1. Middleware to hash the password using bcrypt package


// 2. Middleware to check if the user supply password is equal the corresponding password in the database


const User = model("User", userSchema);

module.exports = User;