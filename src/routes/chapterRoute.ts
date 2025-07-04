import express from "express";
import { authenticateUser } from "../middleware/user";
import {
  addNewChapter,
  deleteChapterById,
  toggleChapterPublish,
  updateChapter,
} from "../controller/chapterController";
import { courseBasePath } from "../constants";

const router = express();

//Create Chapter (by courseId)
router.post(`${courseBasePath}/chapter`, authenticateUser, addNewChapter);

//Update Chapter (by courseId and chapterId)
router.patch(`${courseBasePath}/chapter/:chapterId`, authenticateUser, updateChapter);

//toggle publish
router.patch(
  `${courseBasePath}/chapter/:chapterId/toggle-publish`,
  authenticateUser,
  toggleChapterPublish
);

//Remove Chapter by (by courseId and chapterId)
router.delete(
  `${courseBasePath}/chapter/:chapterId`,
  authenticateUser,
  deleteChapterById
);

//fetch chapters - not needed

export default router;
