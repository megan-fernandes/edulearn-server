import { Request, Response } from "express";
import HTTPError from "../utility/httpError";
import { Helpers } from "../utility/helpers";
import { httpStatusCodes } from "../utility/statusCodes";
import {
  ICreateLecture,
  IEditLecture,
  ILectureIds,
} from "../utility/types/lecture.types";
import {
  VCreateLecture,
  VUpdateLecture,
} from "../utility/validations/lectureValidation";
import { LectureServices } from "../services/lectureService";

const lectureObj = new LectureServices();

export const addNewLecture = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unaothorised", 401);
    const { chapterId } = req.params;

    const { title, description, type, articleData, url } = req.body;
    const content = req.file;
    if (!title || !chapterId || !type)
      throw new HTTPError("Missing required fields", 412);

    const data: ICreateLecture = {
      chapterId: chapterId.toString(),
      title,
      description,
      type,
      content,
      articleData,
      url,
    };

    Helpers.validateWithZod(VCreateLecture, data);
    const newLecture = await lectureObj.createLecture(data, user);
    const code = newLecture.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, newLecture));
  } catch (err) {
    console.log("Error=>", err);
    if (err instanceof HTTPError) {
      const errorData = err.details || err.message;
      res
        .status(httpStatusCodes[err.code].code)
        .json(Helpers.formResponse(httpStatusCodes[err.code].code, errorData));
    } else {
      res
        .status(httpStatusCodes[500].code)
        .json(
          Helpers.formResponse(
            httpStatusCodes[500].code,
            "Internal server error"
          )
        );
    }
  }
};

export const updateLecture = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unaothorised", 401);
    const { chapterId, lectureId } = req.params;

    const { title, description, type, articleData, url } = req.body;
    const content = req.file;
    if (!chapterId || !lectureId)
      throw new HTTPError("Missing required fields", 412);

    const data: IEditLecture = {
      chapterId: chapterId.toString(),
      lectureId: lectureId.toString(),
      title,
      description,
      type,
      content,
      articleData,
      url,
    };

    Helpers.validateWithZod(VUpdateLecture, data);
    const editLectureDetails = await lectureObj.updateLecture(data, user);
    const code = editLectureDetails.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(
        Helpers.formResponse(httpStatusCodes[code].code, editLectureDetails)
      );
  } catch (err) {
    console.log("Error=>", err);
    if (err instanceof HTTPError) {
      const errorData = err.details || err.message;
      res
        .status(httpStatusCodes[err.code].code)
        .json(Helpers.formResponse(httpStatusCodes[err.code].code, errorData));
    } else {
      res
        .status(httpStatusCodes[500].code)
        .json(
          Helpers.formResponse(
            httpStatusCodes[500].code,
            "Internal server error"
          )
        );
    }
  }
};

export const toggleLecturePublish = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unauthorised", 401);
    const { lectureId, chapterId } = req.params;
    if (!lectureId || !chapterId)
      throw new HTTPError("Missing required fields", 412);

    const data: ILectureIds = {
      lectureId: lectureId.toString(),
      chapterId: chapterId.toString(),
    };

    const LectureToggleResp = await lectureObj.lectureToggle(data, user);
    const code = LectureToggleResp.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(
        Helpers.formResponse(httpStatusCodes[code].code, LectureToggleResp)
      );
  } catch (err) {
    console.log("Error=>", err);
    if (err instanceof HTTPError) {
      const errorData = err.details || err.message;
      res
        .status(httpStatusCodes[err.code].code)
        .json(Helpers.formResponse(httpStatusCodes[err.code].code, errorData));
    } else {
      res
        .status(httpStatusCodes[500].code)
        .json(
          Helpers.formResponse(
            httpStatusCodes[500].code,
            "Internal server error"
          )
        );
    }
  }
};

export const deleteLectureById = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unauthorised", 401);
    const { lectureId, chapterId } = req.params;
    if (!lectureId || !chapterId)
      throw new HTTPError("Missing required fields", 412);

    const data: ILectureIds = {
      lectureId: lectureId.toString(),
      chapterId: chapterId.toString(),
    };

    const removeLecture = await lectureObj.deleteLecture(data, user);
    const code = removeLecture.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, removeLecture));
  } catch (err) {
    console.log("Error=>", err);
    if (err instanceof HTTPError) {
      const errorData = err.details || err.message;
      res
        .status(httpStatusCodes[err.code].code)
        .json(Helpers.formResponse(httpStatusCodes[err.code].code, errorData));
    } else {
      res
        .status(httpStatusCodes[500].code)
        .json(
          Helpers.formResponse(
            httpStatusCodes[500].code,
            "Internal server error"
          )
        );
    }
  }
};
