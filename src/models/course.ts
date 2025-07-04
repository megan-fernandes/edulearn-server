import mongoose, { Schema, model, Types } from "mongoose";

const courseSchema = new Schema({
  title: { type: String, required: true },
  titleForSearch: { type: String, required: true },
  description: { type: String },
  tags: [
    {
      type: String,
    },
  ],
  level: {
    type: String,
    enum: ["beginner", "intermediate", "expert", "all"],
    default: "all",
  },
  thumbnail: { type: String },
  cost: { type: Number, min: 0.0, default: 0.0 },
  curriculum: [{ type: Types.ObjectId, ref: "Chapter" }], //relations in  mongoose
  instructor: { type: Types.ObjectId, ref: "User", required: true },
  studentsEnrolled: [{ type: Types.ObjectId, ref: "User" }], //relations in  mongoose
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isPublished: {
    type: Boolean,
    default: false,
  },
  rating: { type: Number, min: 0, default: 0 },
});

// Middleware to update `updatedAt` before any query operation
courseSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

courseSchema.pre("updateOne", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

courseSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

//cascade delete chapters when a course is deleted
courseSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const course = this;
    await mongoose
      .model("Chapter")
      .deleteMany({ _id: { $in: course.curriculum } });
    next();
  }
);

export const Course = model("Course", courseSchema);
