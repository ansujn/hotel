"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

const schema = z.object({
  name: z.string().trim().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "10-digit phone (no +91, no spaces)"),
  role: z.enum(["student", "parent", "instructor"]),
});
type FormValues = z.infer<typeof schema>;

interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  default_password: string;
}

export function NewUserForm() {
  const [created, setCreated] = useState<CreateUserResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", role: "student" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setApiError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: `+91${data.phone}`,
          role: data.role,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to create user");
      }
      const json = (await res.json()) as CreateUserResponse;
      setCreated(json);
      form.reset();
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  });

  async function copyPassword() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.default_password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="grid md:grid-cols-[1fr_360px] gap-5 md:gap-8">
      <form
        onSubmit={onSubmit}
        className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-5 md:p-6 space-y-5"
      >
        <Input
          label="Full name"
          placeholder="Ananya Sharma"
          autoComplete="name"
          {...form.register("name")}
          error={form.formState.errors.name?.message}
        />
        <Input
          label="Email"
          type="email"
          placeholder="ananya@example.com"
          autoComplete="email"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <Input
          label="Phone"
          prefix="+91"
          placeholder="9876543210"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          {...form.register("phone")}
          error={form.formState.errors.phone?.message}
        />
        <div>
          <label
            htmlFor="role"
            className="text-xs uppercase tracking-[0.2em] text-[#8A8A96] mb-1.5 block"
          >
            Role
          </label>
          <select
            id="role"
            className="h-12 w-full bg-[#15151C] border border-[#2A2A36] rounded-lg px-3 text-[#F5F5F7] focus:outline-none focus:border-[#E8C872]/70"
            {...form.register("role")}
          >
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>
        {apiError && <div className="text-sm text-red-400">{apiError}</div>}
        <Button size="lg" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "Creating…" : "Create user"}
        </Button>
      </form>

      <aside className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-5 md:p-6">
        {created ? (
          <div>
            <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-3">
              User created
            </div>
            <div className="text-base font-semibold text-white mb-1">
              {created.name}
            </div>
            <div className="text-xs text-[#8A8A96] mb-4">
              {created.email} · {created.phone} · {created.role}
            </div>

            <div className="text-xs uppercase tracking-[0.2em] text-[#8A8A96] mb-1.5">
              Default password
            </div>
            <div className="flex items-center gap-2 mb-3">
              <code className="font-mono text-lg text-[#E8C872] bg-[#0B0B0F] border border-[#2A2A36] rounded-lg px-3 py-2 flex-1">
                {created.default_password}
              </code>
              <button
                type="button"
                onClick={copyPassword}
                className="text-sm min-h-[44px] px-4 py-2 border border-[#2A2A36] rounded-lg hover:border-[#E8C872] text-[#C9C9D1]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-[#8A8A96] leading-relaxed">
              We also emailed this password to <span className="text-white">{created.email}</span>.
              It will only work for the first login — they&rsquo;ll be asked to set a
              new one. This is the only time we&rsquo;ll show this password; note it
              if needed.
            </p>
          </div>
        ) : (
          <div>
            <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-3">
              How it works
            </div>
            <ul className="text-sm text-[#C9C9D1] space-y-2 list-disc list-inside">
              <li>We generate a readable password like <code className="text-[#E8C872]">Ananya-2847</code>.</li>
              <li>The user gets a welcome email with their login + password.</li>
              <li>On first login they&rsquo;re prompted to set a new one.</li>
              <li>Forgot password? They can self-reset via email.</li>
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
