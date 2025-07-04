import { Request, Response } from "express";
import HTTPError from "../utility/httpError";
import { Helpers } from "../utility/helpers";
import { httpStatusCodes } from "../utility/statusCodes";
import { ChapterServices } from "../services/chapterService";
import {
  IChapterIds,
  ICreateChapter,
  IUpdateChapter,
} from "../utility/types/chapter.types";
import {
  VCreateChapter,
  VUpdateChapter,
} from "../utility/validations/chapterValidation";
// import { IGetCommon } from "../utility/types/common.types";

const chapterObj = new ChapterServices();

export const addNewChapter = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unaothorised", 401);
    const { courseId } = req.params;

    const { title } = req.body;
    if (!title || !courseId)
      throw new HTTPError("Missing required fields", 412);

    const data: ICreateChapter = {
      title,
      courseId,
    };

    Helpers.validateWithZod(VCreateChapter, data);
    const newChapter = await chapterObj.createChapter(data, user);
    const code = newChapter.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, newChapter));
  } catch (err) {
    console.log("Error=>",err);
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

export const updateChapter = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unauthorised", 401);
    const { courseId, chapterId } = req.params;
    if (!courseId || !chapterId)
      throw new HTTPError("Missing required fields", 412);

    const { title } = req.body;

    const data: IUpdateChapter = {
      courseId: courseId.toString(),
      chapterId: chapterId.toString(),
      title,
    };

    Helpers.validateWithZod(VUpdateChapter, data);
    const editChapterDetails = await chapterObj.updateChapter(data, user);
    const code = editChapterDetails.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(
        Helpers.formResponse(httpStatusCodes[code].code, editChapterDetails)
      );
  } catch (err) {
    console.log("Error=>",err);
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

export const toggleChapterPublish = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unauthorised", 401);
    const { courseId, chapterId } = req.params;
    if (!courseId || !chapterId)
      throw new HTTPError("Missing required fields", 412);

    const data: IChapterIds = {
      courseId: courseId.toString(),
      chapterId: chapterId.toString(),
    };

    const courseToggleResp = await chapterObj.chapterToggle(data, user);
    const code = courseToggleResp.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, courseToggleResp));
  } catch (err) {
    console.log("Error=>",err);
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

export const deleteChapterById = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unauthorised", 401);
    const { courseId, chapterId } = req.params;
    if (!courseId || !chapterId)
      throw new HTTPError("Missing required fields", 412);

    const data: IChapterIds = {
      courseId: courseId.toString(),
      chapterId: chapterId.toString(),
    };

    const removeChapter = await chapterObj.deleteChapter(data, user);
    const code = removeChapter.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, removeChapter));
  } catch (err) {
    console.log("Error=>",err);
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

// export const getChapter = async (req: Request, res: Response) => {
//   try {
//     const user = req.user;
//     if (!user) throw new HTTPError("Unaothorised", 401);
//     const { view, id, page, limit, search, filterBy, filterValue } = req.query;

//     const data: IGetCommon = {
//       view: view ? (view as IGetCommon["view"]) : "cms",
//       id: id ? id.toString() : undefined,
//       page: page ? parseInt(page as string) : 1,
//       limit: limit ? parseInt(limit as string) : undefined,
//       search: search ? search.toString() : undefined,
//       filterBy: filterBy ? filterBy.toString() : undefined,
//       filterValue: filterValue ? filterValue.toString() : undefined,
//     };
//     const getData = await chapterObj.getChapters(data, user);
//     const code = getData.success ? 200 : 400;
//     res
//       .status(httpStatusCodes[code].code)
//       .json(Helpers.formResponse(httpStatusCodes[code].code, getData));
//   } catch (err) {
//     console.log("Error=>",err);
//       const errorData = err.details || err.message;
//       res
//         .status(httpStatusCodes[err.code].code)
//         .json(Helpers.formResponse(httpStatusCodes[err.code].code, errorData));
//     } else {
//       res
//         .status(httpStatusCodes[500].code)
//         .json(
//           Helpers.formResponse(
//             httpStatusCodes[500].code,
//             "Internal server error"
//           )
//         );
//     }
//   }
// };
