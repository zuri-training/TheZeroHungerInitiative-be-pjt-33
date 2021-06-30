const {Schema, model} = require("mongoose");

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.ObjectId,
    },
    senderId: {
      type: Schema.ObjectId,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = model("Message", messageSchema);

module.exports = Message;