"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-controls";
import { useMocks } from "@/lib/config/env";
import { toAppError } from "@/lib/errors/app-error";
import { authApi } from "../api/auth";
import { loginSchema } from "../schemas/auth";

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: useMocks ? "admin@trustcode.test" : "",
      password: useMocks ? "TrustCode123!" : "",
    },
  });
  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      const requested = searchParams.get("returnTo");
      const target =
        requested?.startsWith("/") && !requested.startsWith("//")
          ? requested
          : "/dashboard";
      // A full navigation guarantees the Set-Cookie response from login is
      // included when the protected route guard runs.
      window.location.replace(target);
    },
  });
  const resend = useMutation({ mutationFn: () => authApi.resendVerification(form.getValues("email")) });
  const error = login.error ? toAppError(login.error) : null;
  // The backend blocks sign-in until the address is verified and re-sends the link on
  // its own, so this only offers a manual retry after the cooldown.
  const needsVerification = error?.code === "EMAIL_VERIFICATION_REQUIRED";

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit((values) => login.mutate(values))}
      noValidate
    >
      {error ? (
        <Alert
          variant={needsVerification ? "warning" : "danger"}
          title={needsVerification ? "Verify your email" : "Sign in failed"}
          action={
            needsVerification && !resend.isSuccess ? (
              <Button
                size="sm"
                variant="secondary"
                type="button"
                loading={resend.isPending}
                onClick={() => resend.mutate()}
              >
                Resend link
              </Button>
            ) : undefined
          }
        >
          {resend.isSuccess ? "A new verification link is on its way." : error.message}
        </Alert>
      ) : null}
      <FormField
        label="Email address"
        htmlFor="email"
        error={form.formState.errors.email?.message}
        required
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby={
            form.formState.errors.email ? "email-error" : undefined
          }
          {...form.register("email")}
        />
      </FormField>
      <FormField
        label="Password"
        htmlFor="password"
        error={form.formState.errors.password?.message}
        required
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          aria-describedby={
            form.formState.errors.password ? "password-error" : undefined
          }
          {...form.register("password")}
        />
      </FormField>
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-white/80 hover:text-white"
        >
          Forgot password?
        </Link>
      </div>
      <Button
        type="submit"
        loading={login.isPending}
        className="w-full bg-white text-brand shadow-none hover:bg-white/90 hover:text-brand"
      >
        Sign in
      </Button>
      {useMocks ? (
        <div className="rounded-[var(--radius-md)] bg-white/10 p-3 text-xs text-white/80">
          <p className="font-medium text-white">Mock-mode accounts</p>
          <p className="mt-1">Admin: admin@trustcode.test</p>
          <p>Member: member@trustcode.test</p>
          <p>Password: TrustCode123!</p>
        </div>
      ) : null}
    </form>
  );
}
