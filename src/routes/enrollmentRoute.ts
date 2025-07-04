import express from "express";
import { authenticateUser } from "../middleware/user";
import {
  courseProgress,
  enrollStudentInCourse,
  getEnrolledCourses,
  rateCourse,
  updateCourseProgress,
} from "../controller/enrollmentController";

const router = express();

//enroll student in course - also add instructor id as contact (both ways)
router.post("/student/enroll", authenticateUser, enrollStudentInCourse);

//fetch user progress(all and by courseId)
router.get("/student/progress", authenticateUser, courseProgress);

//fetch all courses enrolled by student
router.get("/student/courses/enrolled",authenticateUser, getEnrolledCourses)

//update course progress (by courseId and lectureId)
router.patch("/student/progress/:courseId/:lectureId", authenticateUser, updateCourseProgress);

//Rate Course(enrolled only)
router.post("/student/rate/:courseId", authenticateUser, rateCourse);

export default router;
