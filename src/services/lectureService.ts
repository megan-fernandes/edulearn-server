import { bucketUrl } from "../constants";
import { Chapter } from "../models/chapter";
import { Course } from "../models/course";
import { Enrollment } from "../models/enrollment";
import { Lecture } from "../models/lecture";
import { catchError } from "../utility/catchBlock";
import { publishNotification } from "../utility/connection";
import { deleteFile } from "../utility/fileManagement/delete";
import { uploadFile } from "../utility/fileManagement/upload";
import HTTPError from "../utility/httpError";
import { INotificationMessage } from "../utility/types/activity.types";
import { ITokenData } from "../utility/types/auth.types";
import {
  ICreateLecture,
  IEditLecture,
  ILectureIds,
} from "../utility/types/lecture.types";

export class LectureServices {
  public async createLecture(data: ICreateLecture, user: ITokenData) {
    try {
      const { chapterId, type, content, articleData, title, description, url } =
        data;

      //ensure chapter exists
      const findChapter = await this.validateUser(chapterId, user);

      const createData: any = {
        type,
        title,
        description,
      };

      if (content) {
        //upload pdf/video to s3
        const { key } = await uploadFile(content, "chapter-asset");
        createData.url = `${bucketUrl}/chapter-asset/${key}`;
      }
      if (articleData) createData.articleData = articleData;
      if (url) createData.url = url;

      //find course to update
      const newLecture = await Lecture.create({
        ...createData,
      });
      if (!newLecture) throw new HTTPError("Could not create Lecture", 404);

      findChapter.lectures.push(newLecture._id);
      findChapter.save();

      return {
        success: true,
        message: "Lecture created Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async updateLecture(data: IEditLecture, user: ITokenData) {
    try {
      const {
        chapterId,
        lectureId,
        type,
        content,
        articleData,
        title,
        description,
      } = data;

      //ensure chapter exists
      await this.validateUser(chapterId, user);

      //ensure lecture exist
      const findLecture = await Lecture.findOne({ _id: lectureId });
      if (!findLecture) throw new HTTPError("Could not find lecture", 404);

      //manage content
      const updateData: any = {
        title,
        description,
      };
      if (type) updateData.type = type;
      else updateData.$unset = { type: "" };
      if (content) {
        //delete existing content from s3 if exists
        if (findLecture.url) {
          const existingKey = findLecture.url.split(`${bucketUrl}/`)[1];
          await deleteFile(existingKey);
        }
        //if content is provided, upload new content
        //content can be pdf or video
        if (findLecture.articleData) {
          updateData.$unset = { articleData: "" }; // remove existing articleData if it exists
        }
        if (findLecture.url && articleData) {
          updateData.$unset = { url: "" }; // remove existing url if it exists
        }
        //upload new content
        //upload pdf/video to s3
        const { key } = await uploadFile(content, "chapter-asset");
        updateData.url = `${bucketUrl}/chapter-asset/${key}`;
      }
      if (articleData) {
        if (findLecture.url) {
          const existingKey = findLecture.url.split(`${bucketUrl}/`)[1];
          await deleteFile(existingKey);
        }
        updateData.$unset = { url: "" };
        updateData.articleData = articleData;
      }

      //find course to update
      const updateLecture = await Lecture.findOne({
        _id: lectureId,
      }).updateOne(updateData);
      if (!updateLecture) throw new HTTPError("Could not update Lecture", 404);

      return {
        success: true,
        message: "Lecture Updated Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async deleteLecture(data: ILectureIds, user: ITokenData) {
    try {
      const { lectureId, chapterId } = data;
      //find if chapter is under the course
      await this.validateUser(chapterId, user);

      //find lecture to delete
      const findLecture = await Lecture.findOne({
        _id: lectureId,
      });
      if (!findLecture) throw new HTTPError("Lecture not found", 404);

      if (findLecture.url) {
        const existingKey = findLecture.url.split(`${bucketUrl}/`)[1];
        await deleteFile(existingKey);
      }
      await Lecture.deleteOne({ _id: lectureId });
      await this.updateEnrollmentData(chapterId, lectureId, "remove");

      return {
        success: true,
        message: "Deleted Lecture Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async lectureToggle(data: ILectureIds, user: ITokenData) {
    try {
      const { lectureId, chapterId } = data;
      //find if chapter is under the course
      await this.validateUser(chapterId, user);

      //find lecture to delete
      const findLecture = await Lecture.findOne({
        _id: lectureId,
      });
      if (!findLecture) throw new HTTPError("Lecture not found", 404);

      findLecture.isPublished = !findLecture.isPublished;
      findLecture.save();

      await this.updateEnrollmentData(chapterId, lectureId, "add");

      return {
        success: true,
        message: "Updated Lecture Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  private async validateUser(chapterId: string, user: ITokenData) {
    //ensure chapter exists
    const findChapter = await Chapter.findOne({ _id: chapterId });
    if (!findChapter) throw new HTTPError("Could not find chapter", 404);

    //ensure chapter is under course that belongs to correct instructor
    const query: any = { instructor: user.id };
    query.curriculum = { $in: [chapterId] };
    const findCourse = await Course.findOne(query);
    if (!findCourse)
      throw new HTTPError("Could not find course under this instructor", 404);
    return findChapter;
  }

  private async updateEnrollmentData(
    chapterId: string,
    lectureId: string,
    action: "add" | "remove"
  ) {
    //update enrollment progress for students
    //1. find course
    const findCourse = await Course.findOne({
      curriculum: {
        $in: [chapterId],
      },
    }).populate({
      path: "curriculum",
      select: "_id lectures",
      populate: {
        path: "lectures",
        select: "_id",
      },
    });
    if (!findCourse) throw new HTTPError("Course not found", 404);

    // Find all enrollments for this course
    const enrollments = await Enrollment.find({
      course: findCourse._id,
    });
    console.log(findCourse.curriculum);

    //find all lectures
    // Flatten all lectures from all curriculum chapters
    const allLectureIds = findCourse.curriculum
      .flatMap((chapter: any) => chapter.lectures)
      .map((lec: any) => lec._id.toString());

    const lectureExists = allLectureIds.includes(lectureId.toString());

    if (!lectureExists) {
      throw new HTTPError("Lecture does not belong to this course.", 400);
    }

    switch (action) {
      case "add":
        {
          for (const enrollment of enrollments) {
            if (!enrollment.completedMaterials.includes(lectureId)) {
              // enrollment.completedMaterials.push(lectureId);
              enrollment.completionPercentage =
                (enrollment.completedMaterials.length / allLectureIds.length) *
                100;
              await enrollment.save();
            }
          }
          const message: INotificationMessage = {
            heading: "Course Updated",
            createdAt: new Date(),
            type: "courseEdited",
            courseTitle: findCourse.title as string, // Ensure title is a string
            instructorId: findCourse.instructor?.toString() || "", // Convert instructor to string or fallback to empty string
            recipients: enrollments.map((enrollment) =>
              enrollment.student.toString()
            ),
          };
          console.log("message:::", message);

          await publishNotification("notifications", message);
        }
        break;
      case "remove": {
        for (const enrollment of enrollments) {
          if (enrollment.completedMaterials.includes(lectureId)) {
            const index = enrollment.completedMaterials.indexOf(lectureId);
            if (index > -1) {
              // only splice array when item is found
              enrollment.completedMaterials.splice(index, 1); // 2nd parameter means remove one item only
            }

            enrollment.completionPercentage =
              (enrollment.completedMaterials.length / allLectureIds.length) *
              100;
            await enrollment.save();
          }
        }
      }
    }
    // console.log("ENROLLMENT::", enrollments);
    return true;
  }
}
