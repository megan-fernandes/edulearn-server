import mongoose, { model, Types } from "mongoose";

const Schema = mongoose.Schema;

const chapterSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  lectures: [{ type: Types.ObjectId, ref: "Lecture" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to cascade delete lectures when a chapter is deleted
chapterSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const chapter = this;
    await Promise.all([
      mongoose.model("Lecture").deleteMany({ _id: { $in: chapter.lectures } }),
      mongoose
        .model("Course")
        .updateMany(
          { "curriculum._id": chapter._id },
          { $pull: { curriculum: { _id: chapter._id } } }
        ),
    ]);
    next();
  }
);

export const Chapter = model("Chapter", chapterSchema);
