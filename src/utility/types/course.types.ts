import { courseLevels } from "../../constants";

export interface ICreateCourse {
  title: string;
  description?: string;
}

export interface IUpdateCourseBasics {
  courseId: string;
  title?: string;
  description?: string;
  tags?: string[];
  level?: courseLevels;
  thumbnail?: string;
  cost?: number;
}

export type TCourseData = {
  _id: string;
  title: string;
  titleForSearch: string;
  description?: string;
  tags?: string[];
  level: "beginner" | "intermediate" | "expert" | "all"; // Enum for course level
  thumbnail?: string;
  cost: number;
  // curriculum: Types.ObjectId[]; // References Chapter IDs
  // instructor: Types.ObjectId; // References User ID
  // studentsEnrolled: Types.ObjectId[]; // References User IDs
  createdAt?: Date;
  updatedAt?: Date;
  isPublished: boolean;
  rating: number;
};
