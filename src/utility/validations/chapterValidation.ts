import z from "zod";

export const VCreateChapter = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Chapter Title is required")
    .max(250, "Course title cannot exceed 250 characters"),
});

export const VUpdateChapter = z.object({
  courseId: z.string().min(1, "CourseId is needed"),
  chapterId: z.string().min(1, "chapterId is needed"),
  title: z
    .string()
    .trim()
    .max(250, "Chapter title cannot exceed 250 characters")
    .optional(),
});
