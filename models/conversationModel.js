const {Schema, model} = require("mongoose");

const membersSchema = new Schema({
  senderId: {
    type: Schema.ObjectId,
    required: [true, "Provide senderId"]
  },
  receiverId: {
    type: Schema.ObjectId,
    required: [true, "Provide receiverId"]
  }
});

const conversationSchema = new Schema(
  {
    //members: [membersSchema]
    members: Array
  },
  { timestamps: true }
);

const Conversation = model("Conversation", conversationSchema);

module.exports = Conversation;