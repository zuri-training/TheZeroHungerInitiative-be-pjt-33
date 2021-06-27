const CRUDAPI = require("./CRUD");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const conversationAPI = new CRUDAPI(Conversation);
const messageAPI = new CRUDAPI(Message);

exports.createConversation = conversationAPI.createData();
exports.getAllConversation = conversationAPI.getAllData();
exports.getConversation = conversationAPI.getData();

exports.createMessage = messageAPI.createData();
exports.getAllMessage = messageAPI.getAllData();
exports.getMessage = messageAPI.getData();