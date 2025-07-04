import mongoose, { model, Types } from "mongoose";

const Schema = mongoose.Schema;

const contactSchema = new Schema({
  contact: [
    {
      userDetails: { type: Types.ObjectId, ref: "User", required: true },
      chatId: { type: Types.ObjectId, ref: "Chat" },
    },
  ],
  primaryUser: { type: Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Contact = model("Contact", contactSchema);
