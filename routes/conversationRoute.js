const express = require("express");

const { createConversation, getAllConversation, getSpecificUserConversation } = require ("../controllers/chatController");
const auth = require ("../controllers/authController");

 class ConversationRouter {
   constructor(router) {
     this.router = router;
   }
   
   conversationRoute() {
     // All route from here are authenticated
     this.router.use(auth.authenticate());
     
     this.router
      .route("/")
      .post(auth.authorize("admin", "volunteer", "donor"), createConversation)
      //.post(createConversation)
      .get(auth.authorize("admin"), getAllConversation);
      
      this.router
      .route("/:userId")
      .get(auth.authorize("admin", "volunteer", "donor"), getSpecificUserConversation);
      //.get(getSpecificUserConversation);
      
    return this.router;
   }
 }
 
  module.exports = new ConversationRouter(express.Router()).conversationRoute();
 