import mongoose, { model } from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  profile: { type: String },
  password: { type: String },
  googleId: { type: String }, // Only for Google users
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },
  createdAt: { type: Date, default: Date.now },
  refreshToken: { type: String },
  resetPasswordData: {
    resetToken: { type: String },
    resetTokenExp: {
      type: Number,
    },
  },
});

export const User = model("User", userSchema);
