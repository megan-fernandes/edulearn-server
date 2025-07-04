import { Chapter } from "../models/chapter";
import { Course } from "../models/course";
import { catchError } from "../utility/catchBlock";
import HTTPError from "../utility/httpError";
import { ITokenData } from "../utility/types/auth.types";
import {
  IChapterIds,
  ICreateChapter,
  IUpdateChapter,
} from "../utility/types/chapter.types";
// import { IGetCommon } from "../utility/types/common.types";

export class ChapterServices {
  public async createChapter(data: ICreateChapter, user: ITokenData) {
    try {
      const { title, courseId } = data;

      //find course
      const findCourse = await this.findCourse({
        courseId,
        instructorId: user.id,
      });

      const addChapter = await Chapter.create({
        title,
      });
      if (!addChapter) throw new HTTPError("Could not create chapter", 400);

      findCourse.curriculum.push(addChapter._id);
      findCourse.save();

      return {
        success: true,
        data: {
          _id: addChapter._id,
          title: addChapter.title,
          isPublished: addChapter.isPublished,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async updateChapter(data: IUpdateChapter, user: ITokenData) {
    try {
      const { courseId, chapterId, title } = data;

      //find if chapter is under the course
      await this.findCourse({ courseId, instructorId: user.id, chapterId });

      //find chapter to update
      const findChapter = await Chapter.findOne({
        _id: chapterId,
      }).updateOne({
        title,
      });
      if (!findChapter) throw new HTTPError("Could not find Course", 404);

      return {
        success: true,
        message: "Updated chapter Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async chapterToggle(data: IChapterIds, user: ITokenData) {
    try {
      const { courseId, chapterId } = data;
      //find if chapter is under the course
      await this.findCourse({ courseId, instructorId: user.id, chapterId });

      //find chapter to update
      const findChapter = await Chapter.findOne({
        _id: chapterId,
      }).populate({
        path: "lectures",
        select: "isPublished",
      });
      if (!findChapter) throw new HTTPError("Chapter not found", 404);

      //if chapter has no lectures, do not let instructor publish
      if (!findChapter.lectures.length || findChapter.lectures.filter((l: any) => l.isPublished).length === 0)
        throw new HTTPError("Cannot publish a chapter without lectures", 400);

      findChapter.isPublished = !findChapter.isPublished;
      findChapter.save();

      return {
        success: true,
        message: "Updated Chapter Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async deleteChapter(data: IChapterIds, user: ITokenData) {
    try {
      const { courseId, chapterId } = data;
      //find if chapter is under the course
      await this.findCourse({ courseId, instructorId: user.id, chapterId });

      //find chapter to delete
      const findChapter = await Chapter.findOneAndDelete({
        _id: chapterId,
      });
      if (!findChapter) throw new HTTPError("Chapter not found", 404);

      return {
        success: true,
        message: "Deleted Chapter Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }
  // public async getChapters(data: IGetCommon, user: ITokenData) {
  //   try {
  //     const { view, id, page, limit, search } = data;

  //     const skip = page && limit ? (page - 1) * limit : 0;

  //     const filters: any = {};

  //     if (id) {
  //       filters._id = id;
  //     }
  //     if (view == "cms") {
  //       filters.instructor = user.id;
  //     }
  //     if (view == "website") {
  //       filters.isPublished = true;
  //     }
  //     if (search) {
  //       filters.title = {
  //         $regex: /search/,
  //         $options: "i",
  //       };
  //       filters.description = {
  //         $regex: /search/,
  //         $options: "i",
  //       };
  //     }

  //     //find course to update
  //     const [findChapter, totalRecords] = await Promise.all([
  //       limit
  //         ? Chapter.find({
  //             ...filters,
  //           })
  //             .skip(skip)
  //             .limit(limit)
  //             .populate({
  //               path: "curriculum",
  //               populate: {
  //                 path: "lectures",
  //               },
  //             })
  //         : Chapter.find({
  //             ...filters,
  //           })
  //             .skip(skip)
  //             .populate({
  //               path: "curriculum",
  //               populate: {
  //                 path: "lectures",
  //               },
  //             }),
  //       Chapter.find({
  //         ...filters,
  //       }).countDocuments(),
  //     ]);

  //     if (!findChapter || findChapter.length === 0)
  //       throw new HTTPError("Could not find Course", 404);

  //     return {
  //       success: true,
  //       data: {
  //         courses: findChapter,
  //         totalRecords,
  //       },
  //     };
  //   } catch (error: unknown) {
  //     throw catchError(error);
  //   }
  // }

  private async findCourse(params: {
    courseId: string;
    instructorId?: string;
    chapterId?: string;
  }) {
    const { courseId, instructorId, chapterId } = params;
    const query: any = { _id: courseId };
    if (instructorId) {
      query.instructor = instructorId;
    }
    if (chapterId) {
      query.curriculum = { $in: [chapterId] };
    }
    const findCourse = await Course.findOne(query);
    if (!findCourse)
      throw new HTTPError("Could not find course under this instructor", 404);
    return findCourse;
  }
}
