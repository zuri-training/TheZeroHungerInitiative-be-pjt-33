const express = require("express");
const {  } = require ("../controllers/userController");
const {signup, login} = require ("../controllers/authController");

 class UserRouter {
   constructor(router) {
    this.router = router;
   }
   
   // All api routes definition
   apiRoute() {
     this.router.route("/signup").post(signup());
     this.router.route("/login").post(login());
     this.router.route("/forgot-password").post();
     this.router.route("/reset-password").post();
     
     this.router
      .route("/")
      .get();
      
     this.router
      .route("/:id")
      .get()
      .patch()
      .delete();
      
    return this.router;
  }
 }
 
 // Exporting the router returned from the class
module.exports = new UserRouter(express.Router()).apiRoute();
 