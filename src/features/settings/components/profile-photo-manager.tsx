"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/data-display";
import { sessionKeys } from "@/features/auth/hooks/use-session";
import type { SessionUser } from "@/features/auth/types/auth";
import { avatarMaxBytes, publicEnv } from "@/lib/config/env";
import { toAppError } from "@/lib/errors/app-error";
import { cn } from "@/lib/utils/cn";
import { profilePhotoApi, type ProfilePhoto } from "../api/profile-photo";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const profilePhotoKey = ["profile", "avatar"] as const;

export function ProfilePhotoManager({ user }: { user: SessionUser }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const photo = useQuery({
    queryKey: profilePhotoKey,
    queryFn: profilePhotoApi.get,
    initialData: { avatarUrl: user.avatarUrl ?? null },
  });

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const updateSessionAvatar = (result: ProfilePhoto) => {
    queryClient.setQueryData<SessionUser>(sessionKeys.current(), (current) => {
      if (!current) return current;
      if (result.avatarUrl) return { ...current, avatarUrl: result.avatarUrl };
      const withoutAvatar = { ...current };
      delete withoutAvatar.avatarUrl;
      return withoutAvatar;
    });
    queryClient.setQueryData(profilePhotoKey, result);
  };

  const upload = useMutation({
    mutationFn: (selected: File) => profilePhotoApi.upload(selected),
    onMutate: () => {
      setProgress(12);
      setMessage(null);
    },
    onSuccess: (result) => {
      updateSessionAvatar(result);
      clearSelection();
      setProgress(100);
      setMessage({ tone: "success", text: "Profile photo updated." });
    },
    onError: (error) => {
      setProgress(0);
      setMessage({ tone: "error", text: toAppError(error).message });
    },
  });
  const remove = useMutation({
    mutationFn: profilePhotoApi.remove,
    onMutate: () => setMessage(null),
    onSuccess: (result) => {
      updateSessionAvatar(result);
      clearSelection();
      setMessage({ tone: "success", text: "Profile photo removed." });
    },
    onError: (error) =>
      setMessage({ tone: "error", text: toAppError(error).message }),
  });

  useEffect(() => {
    if (!upload.isPending) return;
    const timer = window.setInterval(
      () => setProgress((current) => Math.min(90, current + 11)),
      180,
    );
    return () => window.clearInterval(timer);
  }, [upload.isPending]);

  const selectFile = (selected: File | undefined) => {
    if (!selected) return;
    setMessage(null);
    if (!acceptedTypes.has(selected.type)) {
      setMessage({ tone: "error", text: "Use a JPEG, PNG, or WebP image." });
      return;
    }
    if (selected.size > avatarMaxBytes) {
      setMessage({
        tone: "error",
        text: `Choose an image smaller than ${publicEnv.NEXT_PUBLIC_AVATAR_MAX_MB} MB.`,
      });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setProgress(0);
  };
  const clearSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!upload.isPending) selectFile(event.dataTransfer.files[0]);
  };

  const currentUrl = previewUrl ?? photo.data.avatarUrl ?? undefined;
  const busy = upload.isPending || remove.isPending;
  return (
    <section
      aria-labelledby="profile-photo-heading"
      className="mb-5 border-b pb-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar
            name={user.name ?? user.email}
            {...(currentUrl ? { src: currentUrl } : {})}
            size="xl"
          />
          {previewUrl ? (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-brand px-2 py-0.5 text-[9px] font-semibold text-white">
              Preview
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="profile-photo-heading" className="text-sm font-semibold">
            Profile photo
          </h3>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            JPEG, PNG, or WebP. Up to {publicEnv.NEXT_PUBLIC_AVATAR_MAX_MB} MB.
            Images use a centred square crop.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus aria-hidden className="size-4" />
              {photo.data.avatarUrl || previewUrl
                ? "Replace photo"
                : "Upload photo"}
            </Button>
            {previewUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={clearSelection}
              >
                <X aria-hidden className="size-4" />
                Cancel preview
              </Button>
            ) : null}
            {photo.data.avatarUrl && !previewUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => remove.mutate()}
              >
                <Trash2 aria-hidden className="size-4" />
                {remove.isPending ? "Removing…" : "Remove photo"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "mt-4 grid min-h-24 place-items-center rounded-[var(--radius-lg)] border border-dashed border-border-strong bg-surface-hover/45 px-4 text-center transition-colors",
          dragging && "border-brand bg-surface-active ring-2 ring-focus/15",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Choose profile photo"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-16 w-full items-center justify-center gap-3 rounded-[var(--radius-md)] text-xs text-text-secondary focus-visible:outline-2 focus-visible:outline-focus"
        >
          <UploadCloud aria-hidden className="size-5 text-brand" />
          <span>
            <strong className="text-text-primary">Drop an image here</strong>
            <span className="block">or choose a file</span>
          </span>
        </button>
      </div>
      {file ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] bg-surface-hover px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{file.name}</p>
            <p className="text-[10px] text-text-muted">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            loading={upload.isPending}
            disabled={busy}
            onClick={() => upload.mutate(file)}
          >
            Save photo
          </Button>
        </div>
      ) : null}
      {upload.isPending || progress === 100 ? (
        <div
          className="mt-3"
          role="status"
          aria-label={`Upload ${progress}% complete`}
        >
          <div className="mb-1 flex justify-between text-[10px] text-text-muted">
            <span>
              {progress === 100 ? "Upload complete" : "Uploading photo"}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-active">
            <div
              className="h-full rounded-full bg-brand transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
      {message ? (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={cn(
            "mt-3 text-xs font-medium",
            message.tone === "error" ? "text-danger" : "text-success",
          )}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
