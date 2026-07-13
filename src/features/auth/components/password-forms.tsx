"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { FormField, Input } from "@/components/ui/form-controls";
import { toAppError } from "@/lib/errors/app-error";
import { authApi } from "../api/auth";
import { changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "../schemas/auth";

export function ForgotPasswordForm() {
  type Values = z.infer<typeof forgotPasswordSchema>;
  const form = useForm<Values>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });
  const request = useMutation({ mutationFn: (values: Values) => authApi.forgotPassword(values.email) });
  if (request.isSuccess) return <Alert variant="success" title="Check your inbox">If the address belongs to an account, a password-reset link has been sent. <Link className="underline" href="/login">Return to sign in</Link>.</Alert>;
  return <form className="grid gap-5" onSubmit={form.handleSubmit((values) => request.mutate(values))} noValidate>{request.error ? <Alert variant="danger" title="Request failed">{toAppError(request.error).message}</Alert> : null}<FormField label="Email address" htmlFor="email" error={form.formState.errors.email?.message}><Input id="email" type="email" autoComplete="email" {...form.register("email")} /></FormField><Button type="submit" loading={request.isPending}>Send reset link</Button></form>;
}

export function ResetPasswordForm() {
  type Values = z.infer<typeof resetPasswordSchema>;
  const token = useSearchParams().get("token") ?? "";
  const form = useForm<Values>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { token, password: "" } });
  const reset = useMutation({ mutationFn: (values: Values) => authApi.resetPassword(values.token, values.password) });
  if (reset.isSuccess) return <Alert variant="success" title="Password updated">You can now <Link className="underline" href="/login">sign in with your new password</Link>.</Alert>;
  return <form className="grid gap-5" onSubmit={form.handleSubmit((values) => reset.mutate(values))} noValidate>{!token ? <Alert variant="danger" title="Invalid reset link">The link does not include a reset token.</Alert> : null}{reset.error ? <Alert variant="danger" title="Reset failed">{toAppError(reset.error).message}</Alert> : null}<input type="hidden" {...form.register("token")} /><FormField label="New password" htmlFor="password" description="Use at least 12 characters." error={form.formState.errors.password?.message}><Input id="password" type="password" autoComplete="new-password" {...form.register("password")} /></FormField><Button type="submit" loading={reset.isPending} disabled={!token}>Set new password</Button></form>;
}

export function ChangePasswordForm() {
  type Values = z.infer<typeof changePasswordSchema>;
  const form = useForm<Values>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: "", newPassword: "" } });
  const change = useMutation({ mutationFn: (values: Values) => authApi.changePassword(values.currentPassword, values.newPassword), onSuccess: () => form.reset() });
  return <form className="grid max-w-xl gap-5" onSubmit={form.handleSubmit((values) => change.mutate(values))} noValidate>{change.isSuccess ? <Alert variant="success" title="Password changed">Your new password is active.</Alert> : null}{change.error ? <Alert variant="danger" title="Change failed">{toAppError(change.error).message}</Alert> : null}<FormField label="Current password" htmlFor="current-password" error={form.formState.errors.currentPassword?.message}><Input id="current-password" type="password" autoComplete="current-password" {...form.register("currentPassword")} /></FormField><FormField label="New password" htmlFor="new-password" description="Use at least 12 characters." error={form.formState.errors.newPassword?.message}><Input id="new-password" type="password" autoComplete="new-password" {...form.register("newPassword")} /></FormField><Button className="w-fit" type="submit" loading={change.isPending}>Change password</Button></form>;
}
