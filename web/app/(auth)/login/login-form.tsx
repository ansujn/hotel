"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type TokenPair } from "@/lib/api";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid phone")
    .max(15)
    .regex(/^[0-9]{10}$/, "10 digits, no spaces"),
});
type PhoneForm = z.infer<typeof phoneSchema>;

const otpSchema = z.object({
  code: z.string().length(6, "6-digit code"),
});
type OtpForm = z.infer<typeof otpSchema>;

type Step = "phone" | "otp";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const onSendOtp = phoneForm.handleSubmit(async (data) => {
    setApiError(null);
    setSubmitting(true);
    const full = `+91${data.phone}`;
    try {
      await api<void>("/auth/otp/send", { method: "POST", body: { phone: full } });
      setPhone(full);
      setStep("otp");
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  });

  const onVerifyOtp = async (code: string) => {
    setApiError(null);
    setSubmitting(true);
    try {
      const tokens = await api<TokenPair>("/auth/otp/verify", {
        method: "POST",
        body: { phone, code },
      });
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokens),
      });
      if (!res.ok) throw new Error("Failed to create session");

      // Fetch /me so we can route based on role — avoids a brittle
      // server-component redirect hop through /home.
      let dest: string = next;
      try {
        const me = await api<{ role?: string }>("/me", {
          token: tokens.access_token,
        });
        console.log("[login] /me role=", me.role);
        if (me.role === "parent") dest = "/parent";
        else if (me.role === "admin" || me.role === "instructor") dest = "/students";
        else dest = "/home";
      } catch (e) {
        console.log("[login] /me failed:", e);
      }
      console.log("[login] navigating to", dest);

      // Hard navigate to defeat any RSC/client-router cache showing the old /home.
      window.location.assign(dest);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "phone") {
    return (
      <div>
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">LOGIN</div>
        <h3 className="serif text-3xl font-black mb-2">Welcome back.</h3>
        <p className="text-sm text-[#8A8A96] mb-8">
          Enter your phone number — we&rsquo;ll send a one-time code.
        </p>
        <form onSubmit={onSendOtp} className="space-y-5">
          <Input
            label="Phone"
            prefix="+91"
            placeholder="9876543210"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            {...phoneForm.register("phone")}
            error={phoneForm.formState.errors.phone?.message}
          />
          {apiError && <div className="text-sm text-red-400">{apiError}</div>}
          <Button size="lg" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send OTP"}
          </Button>
          <p className="text-xs text-[#8A8A96] text-center pt-2">
            Dev tip: use any number; code <code className="text-[#E8C872]">000000</code> works in dev.
          </p>
        </form>
      </div>
    );
  }

  return (
    <OtpStep
      phone={phone}
      onBack={() => setStep("phone")}
      onVerify={onVerifyOtp}
      error={apiError}
      submitting={submitting}
    />
  );
}

function OtpStep({
  phone,
  onBack,
  onVerify,
  error,
  submitting,
}: {
  phone: string;
  onBack: () => void;
  onVerify: (code: string) => void;
  error: string | null;
  submitting: boolean;
}) {
  const form = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    const copy = [...digits];
    copy[i] = val;
    setDigits(copy);
    form.setValue("code", copy.join(""));
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (copy.every((d) => d.length === 1)) {
      form.handleSubmit((d) => onVerify(d.code))();
    }
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const copy = text.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(copy);
    form.setValue("code", copy.join(""));
    if (text.length === 6) form.handleSubmit((d) => onVerify(d.code))();
  };

  return (
    <div>
      <button
        onClick={onBack}
        type="button"
        className="text-xs text-[#8A8A96] hover:text-white mb-4"
      >
        ← Change number
      </button>
      <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">VERIFY</div>
      <h3 className="serif text-3xl font-black mb-2">Enter your code.</h3>
      <p className="text-sm text-[#8A8A96] mb-8">
        Sent a 6-digit code to <span className="text-white">{phone}</span>
      </p>

      <form
        onSubmit={form.handleSubmit((d) => onVerify(d.code))}
        className="space-y-5"
      >
        <div className="flex gap-2 justify-between" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 text-center bg-[#15151C] border border-[#2A2A36] focus:border-[#E8C872] rounded-lg serif text-2xl font-bold text-[#E8C872] outline-none"
            />
          ))}
        </div>
        {error && <div className="text-sm text-red-400">{error}</div>}
        <Button
          size="lg"
          variant="primary"
          className="w-full"
          disabled={submitting || digits.some((x) => !x)}
        >
          {submitting ? "Verifying..." : "Verify & continue"}
        </Button>
      </form>
    </div>
  );
}
