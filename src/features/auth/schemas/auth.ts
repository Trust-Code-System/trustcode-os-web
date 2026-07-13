import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const forgotPasswordSchema = z.object({ email: z.email("Enter a valid email address.") });

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "The reset link is missing its token."),
  password: z.string().min(12, "Use at least 12 characters."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(12, "Use at least 12 characters."),
});
