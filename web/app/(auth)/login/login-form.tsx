"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

const schema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Enter your email or 10-digit phone")
    .refine(
      (v) =>
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || /^\+?\d{10,15}$/.test(v),
      "Enter a valid email or phone",
    ),
  password: z.string().min(1, "Enter your password"),
});
type FormValues = z.infer<typeof schema>;

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  must_change_password: boolean;
  role: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";

  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setApiError(null);
    setSubmitting(true);
    try {
      const res = await api<LoginResponse>("/auth/password/login", {
        method: "POST",
        body: { identifier: data.identifier, password: data.password },
      });

      // Persist tokens in httpOnly cookies via our session route.
      const s = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
        }),
      });
      if (!s.ok) throw new Error("Failed to create session");

      // First login → must change password before using app.
      if (res.must_change_password) {
        window.location.assign("/account/password?first=1");
        return;
      }

      // Role-based default landing.
      let dest = next;
      if (next === "/home" || next === "/") {
        if (res.role === "parent") dest = "/parent";
        else if (res.role === "admin" || res.role === "instructor")
          dest = "/students";
        else dest = "/home";
      }
      window.location.assign(dest);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div>
      <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">LOGIN</div>
      <h3 className="serif text-3xl font-black mb-2">Welcome back.</h3>
      <p className="text-sm text-[#8A8A96] mb-8">
        Sign in with your email or phone.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="Email or phone"
          placeholder="you@example.com or 9876543210"
          autoComplete="username"
          {...form.register("identifier")}
          error={form.formState.errors.identifier?.message}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
        />
        {apiError && <div className="text-sm text-red-400">{apiError}</div>}
        <Button size="lg" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
        <div className="flex items-center justify-between text-xs text-[#8A8A96] pt-2">
          <Link href={"/forgot-password" as Route} className="hover:text-[#E8C872]">
            Forgot password?
          </Link>
          <span>Need an account? Ask your instructor.</span>
        </div>
      </form>
    </div>
  );
}
