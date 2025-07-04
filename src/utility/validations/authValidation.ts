import z from "zod";

export const VRegisterUser = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name should be atleast 3 characters long"),
  email: z.string().email(),
  password: z
    .string()
    .trim()
    .min(8, "Password should be atleast 8 characters long"),
  role: z.string(),
});

export const VLoginUser = z.object({
  email: z.string().email(),
  password: z
    .string()
    .trim()
    .min(8, "Password should be atleast 8 characters long"),
  role: z.string(),
});

export const VResetPasswordLink = z.object({
  email: z.string().email(),
});

export const VResetPassword = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .trim()
    .min(8, "Password should be atleast 8 characters long"),
});
