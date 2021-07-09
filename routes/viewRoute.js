const express = require('express');
//const User = require('../models/userModel');
const {
  login,
  signup,
  forgotPassword,
  resetPassword,
  forgotPasswordSuccess,
  home,
  team,
  volunteer,
  donorDashboard,
  verifyMonetaryDonation
} = require('../controllers/viewController');

const auth = require('../controllers/authController');


class ViewRouter {
  constructor(router) {
  this.router = router;
  }
  
  // All view routes definition
  viewRoute() {
  // Used to know if user already login or not on all pages
  this.router.use(auth.authenticateApp());
  
  this.router.get('/signup', signup);
  this.router.get('/login', login);
  this.router.get('/forgot-password', forgotPassword);
  this.router.get('/reset-password', resetPassword);
  this.router.get('/forgot-password/success', forgotPasswordSuccess);
  this.router.get('/team', team);
  this.router.get('/volunteer', volunteer);
  this.router.get('/', home);
  this.router.post('/', (req, res, next) => (req.page='home', next()), home);

  this.router.get(
    '/donor',
    auth.authorizeApp('donor'),
    (req, res, next) => res.redirect('/donor/dashboard')
  );
  
  this.router
    .get(
      '/donor/dashboard',
      auth.authorizeApp('donor'),
      (req, res, next) => ((req.page = 'dashboard'), next()),
      donorDashboard
    );
  
  this.router
    .get(
      '/donor/donations',
      auth.authorizeApp('donor'),
      (req, res, next) => ((req.page = 'donations'), next()),
      donorDashboard
    );
  
  this.router
    .get(
      '/donor/donations/verify',
      auth.authorizeApp('donor'),
      verifyMonetaryDonation
    )
  
  return this.router;
}
}
 
// Exporting the router returned from the class
module.exports = new ViewRouter(express.Router()).viewRoute();
 