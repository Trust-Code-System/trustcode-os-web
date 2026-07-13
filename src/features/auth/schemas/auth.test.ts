import { describe, expect, it } from "vitest";
import { loginSchema, resetPasswordSchema } from "./auth";

describe("authentication schemas", () => {
  it("rejects malformed login values before submission", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "short" }).success).toBe(false);
  });

  it("requires a token and a stronger reset password", () => {
    expect(resetPasswordSchema.safeParse({ token: "", password: "123456789012" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "token", password: "correct horse battery" }).success).toBe(true);
  });
});
