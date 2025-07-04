import mongoose, { model } from "mongoose";

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "successful", "failed", "refund"],
  },
  details: {},
  paymentSessionId: String,
});

export const Payment = model("Payment", paymentSchema);
