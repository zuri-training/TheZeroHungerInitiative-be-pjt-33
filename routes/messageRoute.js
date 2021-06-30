const express = require("express");

const { createMessage, getAllMessage, getMessage } = require ("../controllers/chatController");
const auth = require ("../controllers/authController");

 class MessageRouter {
   constructor(router) {
     this.router = router;
   }
   messageRoute() {
     // All route from here are authenticated
     this.router.use(auth.authenticate());
     
     this.router
      .route("/")
      .post(auth.authorize("admin", "volunteer", "donor"), createMessage)
      .get(auth.authorize("admin"), getAllMessage);
      
      this.router
      .route("/:id")
      .get(auth.authorize("admin", "volunteer", "donor"), getMessage);
      
    return this.router;
   }
 }
 
  module.exports = new MessageRouter(express.Router()).messageRoute();
 