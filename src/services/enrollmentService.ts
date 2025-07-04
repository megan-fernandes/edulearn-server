import mongoose from "mongoose";
import { Contact } from "../models/contacts";
import { Course } from "../models/course";
import { Enrollment } from "../models/enrollment";
import { User } from "../models/user";
import { catchError } from "../utility/catchBlock";
import HTTPError from "../utility/httpError";
import { ITokenData } from "../utility/types/auth.types";
import { IGetCommon } from "../utility/types/common.types";
import {
  IEnrollStudent,
  IRateCourse,
  IUpdateProgress,
} from "../utility/types/enrollment.types";

export class EnrollmentServices {
  public async enrollStudent(data: IEnrollStudent) {
    try {
      const { courseId, studentId } = data;

      //ensure course exists and is published
      const [findCourse, findStudent] = await Promise.all([
        Course.findOne({
          _id: courseId,
          isPublished: true,
        }),
        User.findOne({
          _id: studentId,
          role: "student",
        }),
      ]);
      if (!findCourse) throw new HTTPError("Could not Find Course", 404);
      if (!findStudent) throw new HTTPError("Could not Find Student", 404);

      //check if student is already enrolled
      const isAlreadyEnrolled = findCourse.studentsEnrolled.some(
        (student) => student.toString() === studentId
      );
      if (isAlreadyEnrolled) throw new HTTPError("Already Enrolled", 400);

      //add student to course's enrolled students
      await Enrollment.create({
        course: findCourse._id,
        student: new mongoose.Types.ObjectId(studentId),
      });
      findCourse.studentsEnrolled.push(findStudent._id);
      await findCourse.save();

      //add instructor to students contacts(if student is not in Contacts collection) and vice versa
      await Promise.all([
        Contact.findOneAndUpdate(
          { primaryUser: new mongoose.Types.ObjectId(studentId) },
          { $addToSet: { contact: { userDetails: findCourse.instructor } } },
          { upsert: true, new: true }
        ),

        Contact.findOneAndUpdate(
          { primaryUser: findCourse.instructor },
          {
            $addToSet: {
              contact: { userDetails: new mongoose.Types.ObjectId(studentId) },
            },
          },
          { upsert: true, new: true }
        ),
      ]);

      return {
        success: true,
        message: "Student Enrolled Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async courseProgress(data: IGetCommon, user: ITokenData) {
    try {
      const { id, page, limit } = data;

      const skip = page && limit ? (page - 1) * limit : 0;

      const filters: any = { student: user.id };

      if (id) {
        filters.course = id;
      }

      const [findProgress, totalRecords] = await Promise.all([
        limit
          ? Enrollment.find(filters).skip(skip).limit(limit)
          : Enrollment.find(filters).skip(skip),
        Enrollment.countDocuments(filters),
      ]);

      return {
        success: true,
        data: {
          courses: findProgress,
          totalRecords,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async studentEnrolledCourses(data: IGetCommon, user: ITokenData) {
    try {
      const { page, limit, id } = data;

      const skip = page && limit ? (page - 1) * limit : 0;

      const findQuery: any = { student: user.id };
      if (id) {
        findQuery.course = id;
      }
      const query = Enrollment.find(findQuery).populate({
        path: "course",
        select: "id title instructor thumbnail",
        populate: {
          path: "instructor",
          select: "email fullName",
        },
      });

      if (limit) {
        query.skip(skip).limit(limit);
      } else {
        query.skip(skip);
      }

      const findEnrollments = await query.exec();

      return {
        success: true,
        data: {
          courses: findEnrollments,
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async updateCourseProgress(data: IUpdateProgress, user: ITokenData) {
    try {
      const { lectureId, courseId } = data;

      const [enrollment, course] = await Promise.all([
        Enrollment.findOne({
          course: courseId,
          student: user.id,
        }),
        Course.findOne({ _id: courseId }).populate({
          path: "curriculum",
          select: "_id lectures",
          populate: {
            path: "lectures",
            select: "_id",
          },
        }),
      ]);

      if (!enrollment) {
        throw new HTTPError("Enrollment not found.", 404);
      }

      if (!course || !course.curriculum) {
        throw new HTTPError("Course or curriculum not found.", 404);
      }

      // Flatten all lectures from all curriculum chapters
      const allLectureIds = course.curriculum
        .flatMap((chapter: any) => chapter.lectures)
        .map((lec: any) => lec._id.toString());

      const lectureExists = allLectureIds.includes(lectureId.toString());

      if (!lectureExists) {
        throw new HTTPError("Lecture does not belong to this course.", 400);
      }

      //calculate updated progress
      const updatedProgress =
        ((enrollment.completedMaterials.length + 1) / allLectureIds.length) *
        100;
      if (!enrollment.completedMaterials.includes(lectureId)) {
        enrollment.completedMaterials.push(lectureId);
      }
      enrollment.completionPercentage = updatedProgress;
      enrollment.save();

      return {
        success: true,
        message: "Lecture under course completed",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }

  public async AddCourseRating(data: IRateCourse) {
    try {
      const { courseId, rating, studentId, review } = data;

      //ensure course exists and is published
      //ensure student is enrolled in the course
      const [findCourse, isEnrolled] = await Promise.all([
        Course.findOne({
          _id: courseId,
          isPublished: true,
        }),
        Enrollment.findOne({
          student: studentId,
          course: courseId,
        }),
      ]);
      if (!findCourse) throw new HTTPError("Could not Find Course", 404);
      if (!isEnrolled) throw new HTTPError("Not Enrolled in Course", 400);

      if (isEnrolled.reviewByStudent || isEnrolled.ratingByStudent > 0) {
        throw new HTTPError("Already Rated", 400);
      }

      isEnrolled.ratingByStudent = parseFloat(rating.toFixed(1));
      isEnrolled.reviewByStudent = review;
      await isEnrolled.save();

      //update course rating
      const totalRatings = findCourse.studentsEnrolled.reduce(
        (acc) => acc + (rating || 0),
        0
      );
      const totalStudents = findCourse.studentsEnrolled.length;
      findCourse.rating = totalStudents > 0 ? totalRatings / totalStudents : 0;
      await findCourse.save();

      return {
        success: true,
        message: "Added Course Rating Successfully",
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }
}
