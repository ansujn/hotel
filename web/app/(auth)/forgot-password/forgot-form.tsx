"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      await api<void>("/auth/password/reset/request", {
        method: "POST",
        body: { email: data.email },
      });
      // Always show the same confirmation — do not leak whether the email exists.
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  });

  if (sent) {
    return (
      <div>
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">CHECK YOUR INBOX</div>
        <h3 className="serif text-3xl font-black mb-3">Reset link sent.</h3>
        <p className="text-sm text-[#C9C9D1] mb-2">
          If an account exists for that email, we&rsquo;ve sent a password reset link.
          It expires in 1 hour and can only be used once.
        </p>
        <p className="text-xs text-[#8A8A96] mb-8">
          Didn&rsquo;t get it? Check spam, or wait a minute and try again.
        </p>
        <Link href="/login" className="text-sm text-[#E8C872] hover:underline">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">RESET PASSWORD</div>
      <h3 className="serif text-3xl font-black mb-2">Forgot your password?</h3>
      <p className="text-sm text-[#8A8A96] mb-8">
        Enter the email on your account and we&rsquo;ll email you a reset link.
      </p>
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <Button size="lg" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </Button>
        <div className="text-xs text-[#8A8A96] pt-2">
          <Link href="/login" className="hover:text-[#E8C872]">
            ← Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
