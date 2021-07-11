const CRUDAPI = require("./CRUD");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const conversationAPI = new CRUDAPI(Conversation);
const messageAPI = new CRUDAPI(Message);

exports.createConversation = conversationAPI.createData();
exports.getAllConversation = conversationAPI.getAllData();
exports.deleteConversation = conversationAPI.deleteData();

exports.getSpecificUserConversation = catchAsync(async (req, res, next) => {
  const {userId} = req.params;
  
  const conversation = await Conversation.find({members: {$in: [userId]}});
  
  res.status(200).json({
    status: "success",
    length: conversation.length,
    conversation
  });
});

exports.createMessage = messageAPI.createData();
exports.getAllMessage = messageAPI.getAllData();
exports.getMessage = messageAPI.getData();
exports.deleteMessage = messageAPI.deleteData();

exports.getSpecificConversationMessage = catchAsync(async (req, res, next) => {
  const {conversationId} = req.params;
  
  const message = await Message.find({conversationId});
  
  res.status(200).json({
    status: "success",
    length: message.length,
    message
  });
});
