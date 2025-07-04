import z from "zod";

export const VSendMessage = z.object({
  chatId: z.string().optional(),
  text: z.string().trim().min(1, "Text is required"),
  recieverId: z.string().min(1, "Receiver ID is required"),
});
