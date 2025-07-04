import { Request, Response } from "express";
import HTTPError from "../utility/httpError";
import { Helpers } from "../utility/helpers";
import { httpStatusCodes } from "../utility/statusCodes";
import {
  IEnrollStudent,
  IRateCourse,
  IUpdateProgress,
} from "../utility/types/enrollment.types";
import { EnrollmentServices } from "../services/enrollmentService";
import { IGetCommon } from "../utility/types/common.types";

const enrollmentObj = new EnrollmentServices();

export const enrollStudentInCourse = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const user = req.user;
    if (!user || user.role != "student")
      throw new HTTPError("Unaothorised", 401);
    const { courseId } = req.body;
    if (!courseId) throw new HTTPError("Missing required fields", 412);

    const data: IEnrollStudent = {
      courseId,
      studentId: user.id.toString(),
    };

    const newCourseData = await enrollmentObj.enrollStudent(data);
    const code = newCourseData.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, newCourseData));
  } catch (err) {
    console.log("Error=>", err);
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

export const courseProgress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role != "student")
      throw new HTTPError("Unaothorised", 401);
    const { courseId, page, limit } = req.query;

    const data: IGetCommon = {
      id: courseId ? courseId.toString() : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : undefined,
    };
    const progressData = await enrollmentObj.courseProgress(data, user);
    const code = progressData.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, progressData));
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

export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role != "student")
      throw new HTTPError("Unaothorised", 401);
    const { page, limit, courseId } = req.query;

    const data: IGetCommon = {
      id: courseId ? courseId.toString() : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : undefined,
    };
    const enrolledCoursesData = await enrollmentObj.studentEnrolledCourses(
      data,
      user
    );
    const code = enrolledCoursesData.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(
        Helpers.formResponse(httpStatusCodes[code].code, enrolledCoursesData)
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

export const updateCourseProgress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role != "student")
      throw new HTTPError("Unaothorised", 401);

    const { courseId, lectureId } = req.params;
    if (!courseId || !lectureId)
      throw new HTTPError("Missing required fields", 412);

    const data: IUpdateProgress = {
      courseId,
      lectureId,
    };

    const courseRating = await enrollmentObj.updateCourseProgress(data, user);
    const code = courseRating.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, courseRating));
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

export const rateCourse = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new HTTPError("API Missing body", 412);
    }
    const user = req.user;
    if (!user || user.role != "student")
      throw new HTTPError("Unaothorised", 401);

    const { rating, review } = req.body;
    const courseId = req.params.courseId;
    if (!courseId || !rating)
      throw new HTTPError("Missing required fields", 412);

    const data: IRateCourse = {
      courseId,
      studentId: user.id.toString(),
      rating: parseInt(rating as string),
      review,
    };

    const courseRating = await enrollmentObj.AddCourseRating(data);
    const code = courseRating.success ? 200 : 400;
    res
      .status(httpStatusCodes[code].code)
      .json(Helpers.formResponse(httpStatusCodes[code].code, courseRating));
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
