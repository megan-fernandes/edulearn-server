import z from "zod";
import { base64String, validateDescription } from "./commonValidation";

export const VCreateCourse = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Course Title is required")
      .max(250, "Course title cannot exceed 250 characters"),
    description: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    validateDescription(data, ctx);
  });

export const VUpdateCourseBasics = z
  .object({
    courseId: z.string().min(1, "CourseId is needed"),
    title: z
      .string()
      .trim()
      .max(250, "Course title cannot exceed 250 characters")
      .optional(),
    description: z.string().trim().optional(),
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(2, "Tag should be atleast 2 characters long")
          .max(45, "Tag should be at max 45 characters long")
      )
      .max(7, "Cannot add more than 7 tags under a course")
      .optional(),
    level: z.enum(["beginner", "intermediate", "expert", "all"]).default("all"),
    thumbnail: z.union([z.string().optional(), base64String.optional()]),
    cost: z.number().min(0.0).optional(),
  })
  .superRefine((data, ctx) => {
    validateDescription(data, ctx);
  });

//helpers
