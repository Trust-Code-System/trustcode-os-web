import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_USE_MOCKS: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_MOCK_SCENARIO: z.enum(["success", "empty", "error", "forbidden", "not-found"]).default("success"),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_AVATAR_MAX_MB: z.coerce.number().positive().max(20).default(5),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
  NEXT_PUBLIC_MOCK_SCENARIO: process.env.NEXT_PUBLIC_MOCK_SCENARIO,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_AVATAR_MAX_MB: process.env.NEXT_PUBLIC_AVATAR_MAX_MB,
});

export const useMocks = publicEnv.NEXT_PUBLIC_USE_MOCKS === "true";
export const avatarMaxBytes = publicEnv.NEXT_PUBLIC_AVATAR_MAX_MB * 1024 * 1024;
