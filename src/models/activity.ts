import mongoose, { model } from "mongoose";

const Schema = mongoose.Schema;

const activitySchema = new Schema({
  heading: { type: String, required: true },
  primaryText: { type: String },
  secondaryText: { type: String },
  createdAt: { type: Date, default: Date.now },
  usersToInform: [{ type: String }],
});

export const Activity = model("Activity", activitySchema);
