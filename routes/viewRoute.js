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
  about,
  volunteer,
  donorDashboard,
  verifyMonetaryDonation,
  adminDashboard
} = require('../controllers/viewController');

const auth = require('../controllers/authController');


class ViewRouter {
  constructor(router) {
    this.router = router;
  }
  
  // All view routes definition
  viewRoute() {

    this.router.use(auth.isLoggedIn());
    
    this.router.get('/signup', signup);
    this.router.get('/login', login);
    this.router.get('/forgot-password', forgotPassword);
    this.router.get('/reset-password', resetPassword);
    this.router.get('/forgot-password/success', forgotPasswordSuccess);
    this.router.get('/team', team);
    this.router.get('/volunteer', volunteer);
    this.router.get('/', home);
    this.router.get('/about-us', about);
    this.router.post('/', (req, res, next) => (req.page='home', next()), home);

    // Donor routes
    this.router.get(
      '/donor',
      auth.authenticateApp(),
      auth.authorizeApp('donor'),
      (req, res, next) => res.redirect('/donor/dashboard')
    );
    
    this.router.get(
        '/donor/dashboard',
        auth.authenticateApp(),
        auth.authorizeApp('donor'),
        (req, res, next) => ((req.page = 'dashboard'), next()),
        donorDashboard
      );
    
    this.router.get(
        '/donor/donations',
        auth.authenticateApp(),
        auth.authorizeApp('donor'),
        (req, res, next) => ((req.page = 'donations'), next()),
        donorDashboard
      );
    
    this.router.get(
        '/donor/donations/verify',
        auth.authenticateApp(),
        auth.authorizeApp('donor'),
        verifyMonetaryDonation
      )
    
    this.router.get(
        '/donor/live-chat',
        auth.authenticateApp(),
        auth.authorizeApp('donor'),
        (req, res, next) => ((req.page = 'live-chat'), next()),
        donorDashboard
      );
    
    // Admin routes
    this.router.get(
      '/admin',
      auth.authenticateApp(),
      auth.authorizeApp('admin'),
      (req, res, next) => res.redirect('/admin/dashboard')
    );

    this.router.get(
      '/admin/dashboard',
      auth.authenticateApp(),
      auth.authorizeApp('admin'),
      (req, res, next) => ((req.page = 'dashboard'), next()),
      adminDashboard
    );

    this.router.get(
      '/admin/donations',
      auth.authenticateApp(),
      auth.authorizeApp('admin'),
      (req, res, next) => ((req.page = 'donations'), next()),
      adminDashboard
    );

    this.router.get(
      '/admin/donation-stations',
      auth.authenticateApp(),
      auth.authorizeApp('admin'),
      (req, res, next) => ((req.page = 'donation-stations'), next()),
      adminDashboard
    );

    this.router.get(
      '/admin/live-chat',
      auth.authenticateApp(),
      auth.authorizeApp('admin'),
      (req, res, next) => ((req.page = 'live-chat'), next()),
      adminDashboard
    );

    this.router.get(
      '/admin/users',
      auth.authenticateApp(),
      auth.authorizeApp('admin'),
      (req, res, next) => ((req.page = 'users'), next()),
      adminDashboard
    );
  
  return this.router;
}
}
 
// Exporting the router returned from the class
module.exports = new ViewRouter(express.Router()).viewRoute();
 