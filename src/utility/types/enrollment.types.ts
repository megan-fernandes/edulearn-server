export interface IEnrollStudent {
  courseId: string; // ID of the course to enroll in
  studentId: string;
}

export interface IRateCourse {
  courseId: string; // ID of the course to rate
  studentId: string; // ID of the student rating the course
  rating: number; // Rating value (e.g., 1 to 5)
  review?: string;
}

export interface IUpdateProgress {
  courseId: string; // ID of the course
  lectureId: string;
}
