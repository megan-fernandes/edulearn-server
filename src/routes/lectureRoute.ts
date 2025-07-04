import express from "express";
import { authenticateUser } from "../middleware/user";

import { chapterBasePath } from "../constants";
import { upload } from "../../config/multerConfig";
import { addNewLecture, deleteLectureById, toggleLecturePublish, updateLecture } from "../controller/lectureController";

const router = express();

//Create Lecture (by chapterId)
router.post(
  `${chapterBasePath}/lecture`,
  authenticateUser,
  upload.single("content"),
  addNewLecture
);

//Update Lecture (by chapterId and lectureId)
router.patch(
  `${chapterBasePath}/lecture/:lectureId`,
  authenticateUser,
  upload.single("content"),
  updateLecture
);

//toggle publish
router.patch(
  `${chapterBasePath}/lecture/:lectureId/toggle-publish`,
  authenticateUser,
  toggleLecturePublish
);

//Remove Lecture by (by chapterId and lectureId)
router.delete(
  `${chapterBasePath}/lecture/:lectureId`,
  authenticateUser,
  deleteLectureById
);

export default router;
