const express = require("express");

const { createMessage, getAllMessage, getMessage, getSpecificConversationMessage, deleteMessage } = require ("../controllers/chatController");
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
      //.post(createMessage)
      .get(auth.authorize("admin"), getAllMessage);
      
      this.router
      .route("/:conversationId")
      .get(auth.authorize("admin", "volunteer", "donor"), getSpecificConversationMessage);
      //.get(getSpecificConversationMessage);
      
      this.router
      .route("/:id")
      .delete(auth.authorize("admin",), deleteMessage);
      
    return this.router;
   }
 }
 
  module.exports = new MessageRouter(express.Router()).messageRoute();
 