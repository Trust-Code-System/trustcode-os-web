import { apiRequest } from "@/lib/api/client";
import type { LoginInput, SessionUser } from "../types/auth";

export const authApi = {
  login: (input: LoginInput) => apiRequest<SessionUser>("/api/session/login", { method: "POST", body: input }).then((result) => result.data),
  me: () => apiRequest<SessionUser>("/api/session/me").then((result) => result.data),
  logout: () => apiRequest<{ success: true }>("/api/session/logout", { method: "POST" }).then((result) => result.data),
  forgotPassword: (email: string) => apiRequest<{ success: true }>("/api/session/forgot-password", { method: "POST", body: { email } }).then((result) => result.data),
  resetPassword: (token: string, password: string) => apiRequest<{ success: true }>("/api/session/reset-password", { method: "POST", body: { token, password } }).then((result) => result.data),
  changePassword: (currentPassword: string, newPassword: string) => apiRequest<{ success: true }>("/api/session/change-password", { method: "POST", body: { currentPassword, newPassword } }).then((result) => result.data),
};
