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
    unread: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Message = model("Message", messageSchema);

module.exports = Message;