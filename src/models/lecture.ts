import { model, Schema } from "mongoose";

const lectureSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String, // video, pdf, article
    enum: ["video", "pdf", "article", "url"],
  },
  url: String,
  articleData: String,
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Lecture = model("Lecture", lectureSchema);
