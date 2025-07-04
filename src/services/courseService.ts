import { bucketUrl } from "../constants";
import { Course } from "../models/course";
import { Enrollment } from "../models/enrollment";
import { catchError } from "../utility/catchBlock";
import { deleteFile } from "../utility/fileManagement/delete";
import { uploadImageBase64 } from "../utility/fileManagement/upload";
import HTTPError from "../utility/httpError";
import { textSearchSanitize } from "../utility/stringSanitize";
import { ITokenData } from "../utility/types/auth.types";
import { IGetCommon } from "../utility/types/common.types";
import {
  ICreateCourse,
  IUpdateCourseBasics,
} from "../utility/types/course.types";
import { base64ImageRegex } from "../utility/validations/commonValidation";

export class CourseServices {
  public async CreateCourse(data: ICreateCourse, user: ITokenData) {
    try {
      const { title, description } = data;
      //find if same title exists already
      await this.findDuplicateTitle(title);
      const addCourse = await Course.create({
        title,
        titleForSearch: textSearchSanitize(title),
        description,
        instructor: user.id,
      });
      if (!addCourse) throw new HTTPError("Could not create course", 400);

      return {
        success: true,
        data: {
          id: addCourse._id,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async updateCourseBasics(data: IUpdateCourseBasics, user: ITokenData) {
    try {
      const { courseId, tags, level, thumbnail, cost, title, description } =
        data;

      //find if same title exists already
      if (title) await this.findDuplicateTitle(title, courseId);

      const findCourse = await Course.findOne({
        _id: courseId,
        instructor: user.id,
      });
      if (!findCourse) throw new HTTPError("Could not update Course", 404);
      const existingThumbnail = findCourse.thumbnail
        ? (findCourse.thumbnail as string)
        : undefined;
      let thumbnailURL = undefined;

      //upload thumbnail to s3
      if (existingThumbnail && thumbnail && base64ImageRegex.test(thumbnail)) {
        //delete existing thumbnail from s3
        const key = existingThumbnail.split(`${bucketUrl}/`)[1];
        await deleteFile(key);
        const resp = await uploadImageBase64(thumbnail, "courseThumbnail");
        thumbnailURL = `${bucketUrl}/courseThumbnail/${resp.key}`;
      } else if (thumbnail == existingThumbnail) {
        thumbnailURL = thumbnail;
      } else if (!thumbnail && existingThumbnail) {
        const key = existingThumbnail.split(`${bucketUrl}/`)[1];
        await deleteFile(key);
      } else if (thumbnail && !existingThumbnail) {
        const resp = await uploadImageBase64(thumbnail, "courseThumbnail");
        thumbnailURL = `${bucketUrl}/courseThumbnail/${resp.key}`;
      }

      //find course to update
      const updateData: any = {
        tags,
        level,
        cost,
        title,
        description,
      };

      if (thumbnailURL !== undefined) {
        updateData.thumbnail = thumbnailURL;
      } else {
        updateData.$unset = { thumbnail: "" };
      }

      const updateCourse = await Course.findOne({
        _id: courseId,
      }).updateOne(updateData);
      console.log(updateCourse);
      if (!updateCourse) throw new HTTPError("Could not update Course", 404);

      return {
        success: true,
        message: "Updated Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async courseToggle(courseId: string, user: ITokenData) {
    try {
      //find course to update
      const findCourse = await Course.findOne({
        _id: courseId,
        instructor: user.id,
      });
      if (!findCourse) throw new HTTPError("Could not find Course", 404);

      //if course has no lectures, do not let instructor publish
      if (!findCourse.curriculum.length)
        throw new HTTPError("Cannot publish a course without chapters", 400);

      findCourse.isPublished = !findCourse.isPublished;
      findCourse.save();

      return {
        success: true,
        message: "Updated Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async deleteCourse(courseId: string, user: ITokenData) {
    try {
      //find course to update
      const findCourse = await Course.findOneAndDelete({
        _id: courseId,
        instructor: user.id,
      });
      if (!findCourse) throw new HTTPError("Could not find Course", 404);

      return {
        success: true,
        message: "Deleted Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async getCourses(data: IGetCommon, user: ITokenData) {
    try {
      const { view, id, page, limit, search } = data;

      const skip = page && limit ? (page - 1) * limit : 0;

      const filters: any = {};

      if (id) {
        filters._id = id;
      }
      if (view == "cms") {
        filters.instructor = user.id;
      }
      if (view == "website") {
        filters.isPublished = true;
      }
      if (search) {
        filters.titleForSearch = {
          $regex: /search/,
          $options: "i",
        };
        filters.description = {
          $regex: /search/,
          $options: "i",
        };
      }

      // Dynamically construct the populate options based on the view
      const curriculumPopulateOptions: any = {
        path: "curriculum",
      };

      if (view === "website") {
        curriculumPopulateOptions.match = { isPublished: true }; // Filter only published chapters
        curriculumPopulateOptions.populate = {
          path: "lectures",
          match: { isPublished: true }, // Filter only published lectures
        };
      } else {
        curriculumPopulateOptions.populate = {
          path: "lectures",
        }; // Include all lectures for CMS view
      }

      //find course to update
      const [findCourse, totalRecords] = await Promise.all([
        limit
          ? Course.find({
              ...filters,
            })
              .skip(skip)
              .limit(limit)
              .populate(curriculumPopulateOptions)
              .populate({
                path: "instructor",
                select: "fullName email", // Specify the fields you want to include
              })
          : Course.find({
              ...filters,
            })
              .skip(skip)
              .populate(curriculumPopulateOptions)
              .populate({
                path: "instructor",
                select: "fullName email", // Specify the fields you want to include
              }),
        Course.find({
          ...filters,
        }).countDocuments(),
      ]);

      return {
        success: true,
        data: {
          courses: findCourse,
          totalRecords,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async getCourseReviews(data: IGetCommon) {
    try {
      const { id, page, limit } = data;

      const skip = page && limit ? (page - 1) * limit : 0;

      const findReviews = await Enrollment.find({ course: id })
        .populate({ path: "student", select: "fullName email profile" })
        .skip(skip)
        .limit(limit ?? 3)
        .select("student  ratingByStudent reviewByStudent");

      return {
        success: true,
        data: {
          reviews: findReviews,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  private async findDuplicateTitle(title: string, courseId?: string) {
    const query: any = { titleForSearch: textSearchSanitize(title) };
    if (courseId) {
      query._id = { $ne: courseId };
    }
    const findDuplicateTitle = await Course.findOne(query);
    if (findDuplicateTitle) {
      throw new HTTPError("Course with same title already exists", 400);
    }
    return true;
  }
}
