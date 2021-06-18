const express = require("express");

const { } = require ("../controllers/userController");

 class UserRouter {
   constructor(router) {
    this.router = router;
   }
   
   // All api routes definition
   apiRoute() {
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
 