"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

const schema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z
      .string()
      .min(8, "8+ characters")
      .regex(/[A-Za-z]/, "Include a letter")
      .regex(/\d/, "Include a number"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  })
  .refine((d) => d.next !== d.current, {
    message: "New password must differ from current",
    path: ["next"],
  });
type FormValues = z.infer<typeof schema>;

export function ChangePasswordForm({
  mustChange,
  name,
}: {
  mustChange: boolean;
  name: string;
}) {
  const search = useSearchParams();
  const first = search.get("first") === "1" || mustChange;

  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setApiError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: data.current,
          new_password: data.next,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to change password");
      }
      setDone(true);
      // Route onward after a short beat.
      setTimeout(() => {
        window.location.assign("/home");
      }, 600);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  });

  if (done) {
    return (
      <div>
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">DONE</div>
        <h3 className="serif text-3xl font-black mb-2">Password updated.</h3>
        <p className="text-sm text-[#C9C9D1]">Taking you in…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">
        {first ? "FIRST LOGIN" : "ACCOUNT"}
      </div>
      <h3 className="serif text-3xl font-black mb-2">
        {first ? `Welcome${name ? ", " + name : ""}.` : "Change password"}
      </h3>
      <p className="text-sm text-[#8A8A96] mb-8">
        {first
          ? "Set a new password to continue. Your temporary password won't work again."
          : "Enter your current password, then choose a new one."}
      </p>
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label={first ? "Temporary password" : "Current password"}
          type="password"
          autoComplete="current-password"
          {...form.register("current")}
          error={form.formState.errors.current?.message}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          {...form.register("next")}
          error={form.formState.errors.next?.message}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          {...form.register("confirm")}
          error={form.formState.errors.confirm?.message}
        />
        {apiError && <div className="text-sm text-red-400">{apiError}</div>}
        <Button size="lg" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "Saving…" : "Save password"}
        </Button>
      </form>
    </div>
  );
}
