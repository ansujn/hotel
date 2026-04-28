"use client";

import { useState } from "react";
import {
  Lock,
  UploadCloud,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare,
  Calendar,
  BarChart3,
  Save,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        {authed ? <Dashboard /> : <Gate onUnlock={() => setAuthed(true)} />}
      </main>
      <SiteFooter />
    </>
  );
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pwd.length < 4) {
            setError("Enter the access password.");
            return;
          }
          onUnlock();
        }}
        className="w-full space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#3B1F1A] text-amber-50">
            <Lock size={18} />
          </span>
          <div>
            <h1 className="font-serif text-xl font-semibold text-[#3B1F1A]">
              Owner login
            </h1>
            <p className="text-sm text-[#3B1F1A]/60">
              Enter your access password to manage Kibana Jaipur.
            </p>
          </div>
        </div>
        <input
          autoFocus
          type="password"
          value={pwd}
          onChange={(e) => {
            setPwd(e.target.value);
            setError(null);
          }}
          placeholder="Access password"
          className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-[#3B1F1A] py-2.5 text-sm font-semibold text-amber-50 hover:bg-[#4d2823]"
        >
          Unlock dashboard
        </button>
        <p className="text-xs text-[#3B1F1A]/50">
          Forgot your password? Email{" "}
          <a href="mailto:hello@kibanajaipur.in" className="underline">
            hello@kibanajaipur.in
          </a>
          .
        </p>
      </form>
    </section>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<
    "profile" | "media" | "bookings" | "reviews" | "analytics"
  >("profile");

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
          Owner dashboard
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[#3B1F1A]">
          Kibana Jaipur
        </h1>
      </header>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-xl bg-amber-50 p-1">
        {(
          [
            ["profile", "Profile"],
            ["media", "Media"],
            ["bookings", "Bookings"],
            ["reviews", "Reviews"],
            ["analytics", "Analytics"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              tab === k
                ? "bg-white text-[#3B1F1A] shadow-sm"
                : "text-[#3B1F1A]/70 hover:text-[#3B1F1A]"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "profile" ? <ProfileTab /> : null}
      {tab === "media" ? <MediaTab /> : null}
      {tab === "bookings" ? <BookingsTab /> : null}
      {tab === "reviews" ? <ReviewsTab /> : null}
      {tab === "analytics" ? <AnalyticsTab /> : null}
    </section>
  );
}

function ProfileTab() {
  return (
    <form className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5">
      <h2 className="font-serif text-xl font-semibold">Restaurant profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Restaurant name" defaultValue="Kibana Jaipur" />
        <Field label="Phone" defaultValue="+91 141 4023456" />
        <Field label="Email" defaultValue="hello@kibanajaipur.in" />
        <Field label="Website" defaultValue="https://kibana.saudagars.org" />
      </div>
      <Field
        label="Address"
        defaultValue="Saudagar's Lane, C-Scheme, Jaipur 302001"
      />
      <FieldArea
        label="Description"
        defaultValue="Modern Indian and global flavours served on a rooftop overlooking Jaipur's old city."
      />
      <button
        type="submit"
        disabled
        className="inline-flex items-center gap-2 rounded-xl bg-[#3B1F1A] px-5 py-2.5 text-sm font-semibold text-amber-50 disabled:opacity-50"
        title="Save wired in next sprint"
      >
        <Save size={14} aria-hidden /> Save changes
      </button>
      <p className="text-xs text-amber-700">
        Persistence is wired to the API in the next sprint.
      </p>
    </form>
  );
}

function MediaTab() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <UploadCard
        icon={<VideoIcon size={18} />}
        title="Videos"
        subtitle="Mux-hosted reels for the gallery"
        cta="Upload video"
        hint="Drag a .mp4 — we'll send it to Mux."
      />
      <UploadCard
        icon={<ImageIcon size={18} />}
        title="Photos"
        subtitle="Restaurant + banquet imagery"
        cta="Upload photos"
        hint="JPG / PNG up to 8MB each."
      />
    </div>
  );
}

function BookingsTab() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-700">
          <Calendar size={18} />
        </span>
        <div>
          <h2 className="font-serif text-xl font-semibold">Bookings inbox</h2>
          <p className="text-xs text-[#3B1F1A]/60">
            Reservations & event enquiries from /book.
          </p>
        </div>
      </div>
      <p className="mt-6 rounded-xl border border-dashed border-amber-200 p-8 text-center text-sm text-[#3B1F1A]/60">
        No bookings yet. Submissions land here once the API endpoint goes live.
      </p>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-700">
          <MessageSquare size={18} />
        </span>
        <div>
          <h2 className="font-serif text-xl font-semibold">Reviews moderation</h2>
          <p className="text-xs text-[#3B1F1A]/60">
            Verify, hide, and respond as the verified owner.
          </p>
        </div>
      </div>
      <p className="mt-6 rounded-xl border border-dashed border-amber-200 p-8 text-center text-sm text-[#3B1F1A]/60">
        Moderation queue UI lands next sprint.
      </p>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ["Site visits", "—", "Wires up after deploy"],
        ["Booking requests", "—", "From /book submissions"],
        ["Avg. rating", "4.7", "Live from /reviews"],
      ].map(([label, value, hint]) => (
        <div
          key={label}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-900/5"
        >
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#3B1F1A]/60">
            <BarChart3 size={14} aria-hidden /> {label}
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-[#3B1F1A]">
            {value}
          </p>
          <p className="text-xs text-[#3B1F1A]/50">{hint}</p>
        </div>
      ))}
    </div>
  );
}

function UploadCard({
  icon,
  title,
  subtitle,
  cta,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  cta: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-700">
          {icon}
        </span>
        <div>
          <h3 className="font-serif text-lg font-semibold">{title}</h3>
          <p className="text-xs text-[#3B1F1A]/60">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        disabled
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 py-10 text-sm text-[#3B1F1A]/70 transition disabled:cursor-not-allowed"
      >
        <UploadCloud size={20} aria-hidden />
        <span className="font-medium">{cta}</span>
        <span className="text-xs">{hint}</span>
        <span className="mt-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
          Coming next sprint
        </span>
      </button>
    </div>
  );
}

function Field({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-[#3B1F1A]/60">
        {label}
      </span>
      <input
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
      />
    </label>
  );
}

function FieldArea({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-[#3B1F1A]/60">
        {label}
      </span>
      <textarea
        defaultValue={defaultValue}
        rows={4}
        className="mt-1 w-full resize-y rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
      />
    </label>
  );
}
