import { Request, Response } from "express";
import HTTPError from "../utility/httpError";
import { Helpers } from "../utility/helpers";
import { httpStatusCodes } from "../utility/statusCodes";
import { CourseServices } from "../services/courseService";
import {
  ICreateCourse,
  IUpdateCourseBasics,
} from "../utility/types/course.types";
import {
  VCreateCourse,
  VUpdateCourseBasics,
} from "../utility/validations/courseValidation";
import { courseLevels } from "../constants";
import { IGetCommon } from "../utility/types/common.types";

const courseObj = new CourseServices();

export const addNewCourse = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unaothorised", 401);
    const { title, description } = req.body;
    if (!title) throw new HTTPError("Missing required fields", 412);

    const data: ICreateCourse = {
      title,
      description,
    };

    Helpers.validateWithZod(VCreateCourse, data);
    const newCourseData = await courseObj.CreateCourse(data, user);
    const code = newCourseData.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, newCourseData));
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

export const updateCourseBasics = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unauthorised", 401);
    const courseId = req.params.courseId;
    if (!courseId) throw new HTTPError("Missing required fields", 412);

    const { title, description, tags, level, thumbnail, cost } = req.body;

    const data: IUpdateCourseBasics = {
      courseId: courseId.toString(),
      title,
      description,
      tags,
      level: level ?? courseLevels.all,
      thumbnail,
      cost,
    };

    Helpers.validateWithZod(VUpdateCourseBasics, data);
    const courseBasicsResp = await courseObj.updateCourseBasics(data, user);
    const code = courseBasicsResp.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, courseBasicsResp));
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

export const coursePublishToggle = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unauthorised", 401);
    const courseId = req.params.courseId;
    if (!courseId) throw new HTTPError("Missing required fields", 412);

    const courseToggleResp = await courseObj.courseToggle(courseId, user);
    const code = courseToggleResp.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, courseToggleResp));
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

export const deleteCourseById = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role == "student")
      throw new HTTPError("Unauthorised", 401);
    const courseId = req.params.courseId;
    if (!courseId) throw new HTTPError("Missing required fields", 412);

    const removeCourse = await courseObj.deleteCourse(courseId, user);
    const code = removeCourse.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, removeCourse));
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

export const getCourses = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) throw new HTTPError("Unaothorised", 401);
    const { view, id, page, limit, search, filterBy, filterValue } = req.query;

    const data: IGetCommon = {
      view: view ? (view as IGetCommon["view"]) : "website",
      id: id ? id.toString() : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search ? search.toString() : undefined,
      filterBy: filterBy ? filterBy.toString() : undefined,
      filterValue: filterValue ? filterValue.toString() : undefined,
    };
    const getData = await courseObj.getCourses(data, user);
    const code = getData.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, getData));
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

export const getCourseReviews = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) throw new HTTPError("Unaothorised", 401);
    const { page, limit, filterBy, filterValue } = req.query;

    const courseId = req.params.courseId;
    if (!courseId) throw new HTTPError("Missing required fields", 412);

    const data: IGetCommon = {
      id: courseId.toString(),
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : undefined,
      filterBy: filterBy ? filterBy.toString() : undefined,
      filterValue: filterValue ? filterValue.toString() : undefined,
    };
    const getData = await courseObj.getCourseReviews(data);
    const code = getData.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, getData));
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
