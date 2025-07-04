import { Course } from "../models/course";
import { Enrollment } from "../models/enrollment";
import { catchError } from "../utility/catchBlock";
import { ITokenData } from "../utility/types/auth.types";
import { IGetCommon } from "../utility/types/common.types";
import { CourseServices } from "./courseService";
// import HTTPError from "../utility/httpError";

export class dashboardServices {
  public async dashboardInstructor(user: ITokenData) {
    try {
      const courseParams: IGetCommon = {
        page: 1,
        view: "cms",
      };
      const totalCourses = await new CourseServices().getCourses(
        courseParams,
        user
      );

      const courseIds = totalCourses.data.courses.map((course) => {
        return course._id;
      });

      const totalStudents = await Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: null, studentCount: { $sum: 1 } } },
        { $project: { _id: 0, studentCount: 1 } },
      ]);

      const averageRating = await Course.aggregate([
        { $match: { instructor: user.id } }, // Match courses under the instructor
        { $group: { _id: null, averageRating: { $avg: "$rating" } } }, // Calculate the average rating
        { $project: { _id: 0, averageRating: 1 } }, // Project only the averageRating field
      ]);

      return {
        success: true,
        data: {
          cards: {
            totalCourses: courseIds.length,
            totalStudents: totalStudents[0].studentCount,
            averageRating: averageRating[0]?.averageRating || 0.0,
          },
        },
      };
    } catch (error: unknown) {
      throw catchError(error);
    }
  }
}
