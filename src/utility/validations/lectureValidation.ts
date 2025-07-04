import z from "zod";
import { uploadFileSchema, validateDescription } from "./commonValidation";
import { parseDocument } from "htmlparser2"; // Import for HTML parsing

export const VCreateLecture = z
  .object({
    chapterId: z.string().min(1, "ChapterId is needed"),
    title: z
      .string()
      .trim()
      .min(1, "Course Title is required")
      .max(250, "Lecture title cannot exceed 250 characters"),
    description: z.string().trim().optional(),
    type: z.enum(["video", "pdf", "article", "url"]),
    content: uploadFileSchema.optional(),
    articleData: z.string().trim().optional(),
    url: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    validateDescription(data, ctx);
    validateContent(data, ctx);
  });

export const VUpdateLecture = z
  .object({
    chapterId: z.string().min(1, "ChapterId is needed"),
    lectureId: z.string().min(1, "LectureId is needed"),
    title: z
      .string()
      .trim()
      .min(1, "Course Title is required")
      .max(250, "Lecture title cannot exceed 250 characters")
      .optional(),
    description: z.string().trim().optional(),
    type: z.enum(["video", "pdf", "article", "url"]).optional(),
    content: uploadFileSchema.optional(),
    articleData: z.string().trim().optional(),
    url: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    validateDescription(data, ctx);
    validateContent(data, ctx);
  });

function validateContent(data: any, ctx: any) {
  const { type, content, articleData, url } = data;

  if (type && type === "article") {
    if (!articleData) {
      ctx.addIssue({
        path: ["articleData"],
        code: z.ZodIssueCode.custom,
        message: "Add Content for article under lecture",
      });
    } else {
      // Validate HTML tags in articleData
      try {
        const parsedDocument = parseDocument(articleData, { xmlMode: false }); // Parse the HTML fragment
        if (!parsedDocument || !parsedDocument.children.length) {
          throw new Error("Invalid HTML structure");
        }
      } catch (error) {
        ctx.addIssue({
          path: ["articleData"],
          code: z.ZodIssueCode.custom,
          message: "Invalid HTML tags in articleData",
        });
      }
    }
  } else if (type && (type == "pdf" || type == "video") && !content) {
    ctx.addIssue({
      path: ["content"],
      code: z.ZodIssueCode.custom,
      message: "Add pdf/video file for lecture",
    });
  } else if (type && type == "url" && !url) {
    ctx.addIssue({
      path: ["url"],
      code: z.ZodIssueCode.custom,
      message: "Add Link of content",
    });
  }
}
