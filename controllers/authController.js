const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");


class AuthController {
  constructor(User) {
    this.User = User;
  }
  
  signup() {
    return catchAsync(async (req, res, next) => {
      
      // write your code here
      
    });
  }
  
  login() {
    return catchAsync(async (req, res, next) => {
      
      // write your code in here
      
    });
  }
  
  forgotPassword() {
    
  }
  
  resetPassword() {
    
  }
}

module.exports = new AuthController(User);