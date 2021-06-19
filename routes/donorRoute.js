const express = require("express");

const { } = require ("../controllers/donorController");

 class DonorRouter {
   constructor(router) {
     this.router = router;
   }
   
   settingRoute() {
     this.router
      .route("/")
      .post()
      .get();
      
    return this.router;
   }
 }
 
  module.exports = new DonorRouter(express.Router()).settingRoute();
 