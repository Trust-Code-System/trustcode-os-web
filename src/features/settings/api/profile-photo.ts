import { apiRequest } from "@/lib/api/client";

export type ProfilePhoto = { avatarUrl: string | null };

export const profilePhotoApi = {
  get: () => apiRequest<ProfilePhoto>("/api/backend/profile/avatar").then((result) => result.data),
  upload: (file: File) => {
    const body = new FormData();
    body.append("photo", file);
    return apiRequest<ProfilePhoto>("/api/backend/profile/avatar", { method: "POST", body }).then((result) => result.data);
  },
  remove: () => apiRequest<ProfilePhoto>("/api/backend/profile/avatar", { method: "DELETE" }).then((result) => result.data),
};
