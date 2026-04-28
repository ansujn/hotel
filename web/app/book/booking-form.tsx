"use client";

import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitBooking } from "@/lib/kibana";

interface Props {
  banquets: { id: string; name: string }[];
  occasions: string[];
}

export function BookingForm(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5">
          Loading…
        </div>
      }
    >
      <Inner {...props} />
    </Suspense>
  );
}

function Inner({ banquets, occasions }: Props) {
  const sp = useSearchParams();
  const initialBanquet = sp.get("banquet") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState(occasions[0] ?? "");
  const [banquet, setBanquet] = useState(initialBanquet);
  const [message, setMessage] = useState("");

  const m = useMutation({
    mutationFn: () =>
      submitBooking({
        name,
        email,
        phone,
        date,
        guest_count: guests,
        occasion,
        banquet_id: banquet || undefined,
        message: message || undefined,
      }),
  });

  if (m.isSuccess && m.data) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-amber-900/5">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-1 shrink-0 text-emerald-600"
            size={28}
            aria-hidden
          />
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#3B1F1A]">
              Request received.
            </h2>
            <p className="mt-2 text-[#3B1F1A]/70">
              We've sent a confirmation to{" "}
              <span className="font-medium">{email}</span>. Our team will reply
              within a few hours during business hours.
            </p>
            <p className="mt-3 text-sm text-[#3B1F1A]/60">
              Reference:{" "}
              <span className="font-mono font-semibold text-[#3B1F1A]">
                {m.data.reference}
              </span>
            </p>
            <a
              href="/menu"
              className="mt-6 inline-flex rounded-full bg-[#3B1F1A] px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-[#4d2823]"
            >
              Browse the menu while you wait →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isEvent = !!banquet;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!m.isPending) m.mutate();
      }}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
          />
        </Field>
        <Field label="Phone">
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 …"
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
          />
        </Field>
        <Field label="Date">
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
          />
        </Field>
        <Field label="Guests">
          <input
            required
            type="number"
            min={1}
            max={1000}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value) || 1)}
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
          />
        </Field>
        <Field label="Occasion">
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
          >
            {occasions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Banquet hall (optional)">
        <select
          value={banquet}
          onChange={(e) => setBanquet(e.target.value)}
          className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
        >
          <option value="">Just a table — no banquet</option>
          {banquets.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label={isEvent ? "Tell us about your event" : "Anything we should know?"}
      >
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          placeholder={
            isEvent
              ? "Theme, dietary needs, vendors, music, anything else?"
              : "Allergies, preferred seating, special requests…"
          }
          className="w-full resize-y rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
        />
      </Field>

      {m.error ? (
        <p className="text-sm text-red-600">
          We couldn't send your request — please try again or call us.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={m.isPending}
          className="rounded-full bg-[#3B1F1A] px-6 py-3 text-sm font-semibold text-amber-50 hover:bg-[#4d2823] disabled:opacity-50"
        >
          {m.isPending
            ? "Sending…"
            : isEvent
              ? "Request quote"
              : "Reserve a table"}
        </button>
        <p className="text-xs text-[#3B1F1A]/60">
          By submitting you agree to be contacted by Kibana Jaipur. We don't
          share your info.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-[#3B1F1A]/60">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
