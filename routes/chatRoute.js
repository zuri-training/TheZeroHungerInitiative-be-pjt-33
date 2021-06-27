const express = require("express");

const { createConversation, getAllConversation, getConversation, createMessage, getAllMessage, getMessage } = require ("../controllers/chatController");
const auth = require ("../controllers/authController");

 class DonationRouter {
   constructor(router) {
     this.router = router;
   }
   
   conversationRoute() {
     // all route from here are authenticated
     this.router.use(auth.authenticate());
     
     this.router
      .route("/")
      .post(auth.authorize("admin", "volunteer", "donor"), createConversation)
      .get(auth.authorize("admin"), getAllConversation);
      
      this.router
      .route("/:id")
      .get(auth.authorize("admin", "volunteer", "donor"), getConversation);
      
    return this.router;
   }
   
   messageRoute() {
     // all route from here are authenticated
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
 
  module.exports = new DonationRouter(express.Router()).conversationRoute().messageRoute();
 