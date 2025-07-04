import { lectureType } from "../../constants";

export interface ILectureIds {
  chapterId: string;
  lectureId: string;
}
export interface ICreateLecture {
  chapterId: string;
  title: string;
  description?: string;
  type: lectureType;
  content?: Express.Multer.File;
  articleData?: string;
  url?: string;
}

export interface IEditLecture extends ILectureIds {
  title?: string;
  description?: string;
  type?: lectureType;
  content?: Express.Multer.File;
  articleData?: string;
  url?: string;
}

export interface ILecture {
  _id: string;
  title: string;
  description?: string;
  type: "video" | "pdf" | "article" | "url"; // Enum for lecture type
  url?: string; // URL for video or PDF
  articleData?: string; // HTML content for articles
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
