import z from "zod";
import {
  image_max_file_size,
  max_file_size,
  validFileFormat,
  validImageFormat,
} from "../../constants";

export const containsEmoji = (text: string): boolean => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FAD0}-\u{1FAFF}\u{1F004}\u{1F0CF}\u{1F3C0}-\u{1F3FF}\u{1F9C0}-\u{1F9FF}]/u;
  return emojiRegex.test(text);
};

export const base64ImageRegex = /^data:image\/(png|jpeg|jpg|heif|heic);base64,/;

export const base64String = z
  .string()
  .trim()
  .refine(
    (data) => {
      // Ensure the string matches the base64 image pattern
      if (!base64ImageRegex.test(data)) {
        return false;
      }

      // Extract the base64 encoded part
      const base64String = data.replace(base64ImageRegex, "");

      // Calculate the size in bytes (1 character = 1 byte)
      const sizeInBytes =
        base64String.length * (3 / 4) -
        (data.indexOf("=") > 0 ? data.length - data.indexOf("=") : 0);

      // 2MB = 2 * 1024 * 1024 bytes
      return sizeInBytes <= 2 * 1024 * 1024;
    },
    {
      message:
        "Image must be a valid base64 encoded string and not exceed 2MB in size.",
    }
  );

export const uploadImageSchema = z.object({
  fieldname: z.string().min(1),
  originalname: z.string(),
  mimetype: z.string().refine(
    (mimetype: string) => {
      const org: string = mimetype.split("/").pop() as string;
      return validImageFormat.includes(org);
    },
    {
      message: "file type is not supported",
    }
  ),
  size: z.number().refine((size: number) => size <= image_max_file_size, {
    message: "file must be of maximum 2mb",
  }),
});

export const uploadFileSchema = z.object({
  fieldname: z.string().min(1),
  originalname: z.string(),
  mimetype: z.string().refine(
    (mimetype: string) => {
      const org: string = mimetype.split("/").pop() as string;
      return validFileFormat.includes(org);
    },
    {
      message: "file type is not supported",
    }
  ),
  size: z.number().refine((size: number) => size <= max_file_size, {
    message: "file must be of maximum 10mb",
  }),
});

export function validateDescription(data: any, ctx: any) {
  const { description } = data;
  if (description && containsEmoji(description))
    ctx.addIssue({
      path: ["description"],
      code: z.ZodIssueCode.custom,
      message: "Emoticons are not allowed in course description",
    });
}
