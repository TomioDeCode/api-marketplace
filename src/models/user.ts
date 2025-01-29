import { z } from "zod";
import { USER_ROLE } from "../constant/role";

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const User = z.object({
  id: z.string().uuid().optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(255, "Username must be at most 255 characters long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password must be at most 255 characters long"),
  role: z.nativeEnum(USER_ROLE).optional(),
  isEmailVerified: z.boolean().optional(),
  verificationToken: z.string().nullable().optional(),
  tokenExpiry: z.date().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type User = z.infer<typeof User>;
