const {Schema, model} = require("mongoose");

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.ObjectId,
    },
    sender: {
      type: Schema.ObjectId,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = model("Message", messageSchema);

module.export = Message;