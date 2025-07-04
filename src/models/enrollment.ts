import mongoose, { model, Types } from "mongoose";

const Schema = mongoose.Schema;

const enrollmentSchema = new Schema({
  course: { type: Types.ObjectId, ref: "Course", required: true },
  student: { type: Types.ObjectId, ref: "User", required: true },
  paymentId: { type: Types.ObjectId, ref: "Payment" },
  completedMaterials: [String], // material IDs or titles
  completionPercentage: { type: Number, default: 0.00 },
  ratingByStudent: { type: Number, default: 0.00 }, // 1-5 scale
  reviewByStudent: { type: String },
  enrolledAt: { type: Date, default: Date.now },
});

export const Enrollment = model("Enrollment", enrollmentSchema);
