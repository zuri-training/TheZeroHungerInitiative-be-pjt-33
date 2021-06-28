const {Schema, model} = require("mongoose");
const validator = require("validator");
const crypto = require ("crypto");
const bcrypt = require("bcryptjs");


//validate: [validator.isEmail, "Please provide a valid email"] trim: true,
//timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"
// Preferred name, phone number, email, and password, and password confirm, isDisabled, createdAt, updatedAt, role
const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your first name"]
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"]
  },
  gender: {
    type: String,
    required: [true, "Please provide your gender"]
  },
  address: {
    type: String,
    required: [true, "Please provide your address"]
  },
  username: {
    type: String,
    required: [true, "Please provide your username"],
    unique: true,
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
    enum: ["donor", "admin", "volunteer", "dispatch rider"],
    default: "donor"
  },
  isDisabled: {
    type: String,
    default: false,
    select: false
  },
  badge: {
    type: Number,
    default: 1,
    enum: [1, 2, 3, 4, 5]
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
  },
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"}
});

// 1. Middleware to hash the password using bcrypt package
userSchema.pre("save", async function(next) {
  
  if(!this.isModified("password")) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});


// 2. Middleware to check if the user supply password is equal the corresponding password in the database
userSchema.methods.correctPassword = async function(providedPassword, storedPassword) {
  return await bcrypt.compare(providedPassword, storedPassword);
};


// 3. generate a password reset token
userSchema.methods.passwordResetTokenMethod = function() {
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  
  this.passwordResetExpires = Date.now() + (20  * 60 * 1000) + (1 *60 * 60 * 1000);
  
  return resetToken;
};

const User = model("User", userSchema);

module.exports = User;