const express = require("express");

const { getAllTest, createTest } = require ("../controllers/testController");

 class TestRouter {
   constructor(router) {
     this.router = router;
   }
   
   settingRoute() {
     this.router
      .route("/")
      .post(createTest)
      .get(getAllTest);
      
    return this.router;
   }
 }
 
  module.exports = new TestRouter(express.Router()).settingRoute();
 