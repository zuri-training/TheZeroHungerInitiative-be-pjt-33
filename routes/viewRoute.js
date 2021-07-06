const express = require('express');
//const User = require('../models/userModel');
const { login, signup, forgotPassword, resetPassword, forgotPasswordSuccess, home } = require ('../controllers/viewController');


 class ViewRouter {
   constructor(router) {
    this.router = router;
   }
   
   // All view routes definition
   viewRoute() {
    this.router.get('/signup', signup);
    this.router.get('/login', login);
    this.router.get('/forgot-password', forgotPassword);
    this.router.get('/reset-password', resetPassword);
    this.router.get('/forgot-password/success', forgotPasswordSuccess);
    this.router.get('/', home);
    this.router.post('/', (req, res, next) => (req.page='home', next()), home);
    return this.router;
  }
 }
 
// Exporting the router returned from the class
module.exports = new ViewRouter(express.Router()).viewRoute();
 