const express = require('express');
const { getAllUser, getUser, deleteUser, updateUser } = require ('../controllers/userController');
const auth = require ('../controllers/authController');


 class UserRouter {
   constructor(router) {
    this.router = router;
   }
   
   // All api routes definition
   apiRoute() {
     // user authentication endpoint
     this.router.route('/signup').post(auth.signup());
     this.router.route('/login').post(auth.login());
     this.router.route('/logout').get(auth.logout());
     this.router.route('/forgot-password').post(auth.forgotPassword());
     this.router.route('/reset-password/:resetToken').post(auth.resetPassword());
     this.router.route('/update-password').post(auth.authenticate(), auth.updatePassword());
     this.router.route('/update-details').patch(auth.authenticate(), auth.updateDetails());
     
     // User api endpoint
     // All endpoint from here are protected
     this.router.use(auth.authenticate());
     
     this.router
      .route('/')
      .get(auth.authorize('admin'), getAllUser);
      
     this.router
      .route('/:id')
      .get(getUser)
      .patch(auth.authorize('admin'), updateUser)
      .delete(auth.authorize('admin'), deleteUser);
      
    return this.router;
  }
 }
 
 // Exporting the router returned from the class
module.exports = new UserRouter(express.Router()).apiRoute();
 