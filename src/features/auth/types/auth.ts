export type Role = "ADMIN" | "MEMBER";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  role: Role;
};

export type LoginInput = { email: string; password: string };
