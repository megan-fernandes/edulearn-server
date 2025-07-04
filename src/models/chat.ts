import mongoose, { model, Types } from "mongoose";

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  participants: [{ type: Types.ObjectId, ref: "User", required: true }],
  chats: [
    {
      type: {
        sender: { type: Types.ObjectId, ref: "User", required: true },
        text: String,
        createdAt: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const Chat = model("Chat", chatSchema);
