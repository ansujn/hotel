"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "8+ characters")
      .regex(/[A-Za-z]/, "Include a letter")
      .regex(/\d/, "Include a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const search = useSearchParams();
  const token = search.get("token") ?? "";

  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setApiError(null);
    setSubmitting(true);
    try {
      await api<void>("/auth/password/reset/confirm", {
        method: "POST",
        body: { token, password: data.password },
      });
      setDone(true);
    } catch (e) {
      setApiError(
        e instanceof Error ? e.message : "Link is invalid or expired",
      );
    } finally {
      setSubmitting(false);
    }
  });

  if (!token) {
    return (
      <div>
        <h3 className="serif text-3xl font-black mb-2">Invalid link</h3>
        <p className="text-sm text-[#8A8A96] mb-6">
          The reset link is missing or malformed. Request a new one.
        </p>
        <Link href={"/forgot-password" as Route} className="text-sm text-[#E8C872] hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">DONE</div>
        <h3 className="serif text-3xl font-black mb-3">Password updated.</h3>
        <p className="text-sm text-[#C9C9D1] mb-6">
          You can now sign in with your new password.
        </p>
        <Link href="/login" className="text-sm text-[#E8C872] hover:underline">
          → Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">RESET PASSWORD</div>
      <h3 className="serif text-3xl font-black mb-2">Choose a new password.</h3>
      <p className="text-sm text-[#8A8A96] mb-8">
        At least 8 characters with a letter and a number.
      </p>
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...form.register("confirm")}
          error={form.formState.errors.confirm?.message}
        />
        {apiError && <div className="text-sm text-red-400">{apiError}</div>}
        <Button size="lg" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </div>
  );
}
