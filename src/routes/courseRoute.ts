import express from "express";
import { authenticateUser } from "../middleware/user";
import {
  addNewCourse,
  coursePublishToggle,
  deleteCourseById,
  getCourseReviews,
  getCourses,
  updateCourseBasics,
} from "../controller/courseController";

const router = express();

//Create Course
router.post("/course", authenticateUser, addNewCourse);

//Update Course Basics
router.patch(
  "/course/:courseId/course-basics",
  authenticateUser,
  updateCourseBasics
);

//publish drafted course
router.patch(
  "/course/:courseId/publish-toggle",
  authenticateUser,
  coursePublishToggle
);

//Remove Course by ID
router.delete("/course/:courseId", authenticateUser, deleteCourseById);

//fetch courses
router.get("/course", authenticateUser, getCourses);

router.get("/course/reviews/:courseId", authenticateUser, getCourseReviews);

export default router;
