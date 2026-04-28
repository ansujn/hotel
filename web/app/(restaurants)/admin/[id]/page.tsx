"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminUpdateRestaurant,
  getRestaurant,
  HIGHLIGHT_OPTIONS,
} from "@/lib/restaurants-api";
import {
  Lock,
  Save,
  UploadCloud,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare,
  BarChart3,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminPage({ params }: Props) {
  const { id } = use(params);
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");

  if (!authed) {
    return <PasswordGate onUnlock={(p) => { setPwd(p); setAuthed(true); }} />;
  }

  return <AdminDashboard id={id} password={pwd} />;
}

function PasswordGate({ onUnlock }: { onUnlock: (pwd: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-md items-center px-4 py-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.length < 4) {
            setError("Enter the access password your operator gave you.");
            return;
          }
          onUnlock(value);
        }}
        className="w-full space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200/70"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
            <Lock size={18} />
          </span>
          <div>
            <h1 className="font-serif text-xl font-semibold text-slate-900">
              Restaurant admin
            </h1>
            <p className="text-sm text-slate-500">
              Enter the access password to manage this listing.
            </p>
          </div>
        </div>
        <input
          autoFocus
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder="Access password"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Unlock dashboard
        </button>
      </form>
    </div>
  );
}

function AdminDashboard({ id, password }: { id: string; password: string }) {
  const qc = useQueryClient();
  const { data: r, isLoading, error } = useQuery({
    queryKey: ["restaurant", id, "admin"],
    queryFn: () => getRestaurant(id),
  });

  const [tab, setTab] = useState<"profile" | "media" | "reviews" | "analytics">(
    "profile",
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }
  if (error || !r) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load this restaurant. Check the URL.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Admin · {r.id}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-slate-900">
            {r.name}
          </h1>
        </div>
        <a
          href={`/restaurants/${r.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          View public page →
        </a>
      </header>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {(
          [
            ["profile", "Profile", null],
            ["media", "Media", null],
            ["reviews", "Reviews", null],
            ["analytics", "Analytics", null],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              tab === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "profile" ? (
        <ProfileForm
          restaurantId={id}
          password={password}
          initial={r}
          onSaved={() =>
            qc.invalidateQueries({ queryKey: ["restaurant", id, "admin"] })
          }
        />
      ) : null}
      {tab === "media" ? <MediaPanel videoCount={r.videos.length} imageCount={r.images.length} /> : null}
      {tab === "reviews" ? <ReviewsPanel reviewCount={r.review_count} /> : null}
      {tab === "analytics" ? <AnalyticsPanel /> : null}
    </div>
  );
}

function ProfileForm({
  restaurantId,
  password,
  initial,
  onSaved,
}: {
  restaurantId: string;
  password: string;
  initial: Awaited<ReturnType<typeof getRestaurant>>;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [phone, setPhone] = useState(initial.phone);
  const [website, setWebsite] = useState(initial.website ?? "");
  const [address, setAddress] = useState(initial.address);
  const [avgPrice, setAvgPrice] = useState(initial.avg_price_per_plate);
  const [highlights, setHighlights] = useState<string[]>(initial.highlights);

  const m = useMutation({
    mutationFn: () =>
      adminUpdateRestaurant(restaurantId, password, {
        name,
        description,
        phone,
        website: website || undefined,
        address,
        avg_price_per_plate: avgPrice,
        highlights,
      }),
    onSuccess: onSaved,
  });

  const toggleHighlight = (h: string) =>
    setHighlights((cur) =>
      cur.includes(h) ? cur.filter((x) => x !== h) : [...cur, h],
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!m.isPending) m.mutate();
      }}
      className="space-y-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200/70"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Restaurant name" value={name} onChange={setName} />
        <Input label="Phone" value={phone} onChange={setPhone} />
        <Input
          label="Website"
          value={website}
          onChange={setWebsite}
          placeholder="https://"
        />
        <Input
          label="Avg price per plate (₹)"
          value={String(avgPrice)}
          onChange={(v) => setAvgPrice(Number(v) || 0)}
          type="number"
        />
      </div>
      <Field label="Address">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </Field>
      <Field label="Description">
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </Field>
      <Field label="Highlights">
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHT_OPTIONS.map((h) => {
            const on = highlights.includes(h);
            return (
              <button
                key={h}
                type="button"
                onClick={() => toggleHighlight(h)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                aria-pressed={on}
              >
                {h}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={m.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Save size={14} aria-hidden />
          {m.isPending ? "Saving…" : "Save changes"}
        </button>
        {m.isSuccess ? (
          <span className="text-sm text-emerald-600">Saved.</span>
        ) : null}
        {m.error ? (
          <span className="text-sm text-red-600">
            Save failed — check password.
          </span>
        ) : null}
      </div>
    </form>
  );
}

function MediaPanel({ videoCount, imageCount }: { videoCount: number; imageCount: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <UploadCard
        icon={<VideoIcon size={18} />}
        title="Videos"
        subtitle={`${videoCount} uploaded · max 20`}
        cta="Upload video"
        hint="Drag & drop a .mp4 — we'll send it to Mux."
      />
      <UploadCard
        icon={<ImageIcon size={18} />}
        title="Photos"
        subtitle={`${imageCount} uploaded · max 50`}
        cta="Upload photos"
        hint="JPG / PNG up to 8MB each."
      />
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
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        disabled
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-sm text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed"
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

function ReviewsPanel({ reviewCount }: { reviewCount: number }) {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/70">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
          <MessageSquare size={18} />
        </span>
        <div>
          <h3 className="font-semibold text-slate-900">Reviews moderation</h3>
          <p className="text-xs text-slate-500">
            {reviewCount} total reviews · respond as verified owner
          </p>
        </div>
      </div>
      <p className="mt-6 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        Moderation queue is wired up in Phase 1.5.
      </p>
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ["Profile views", "1,284", "+12% wow"],
        ["Video plays", "342", "+5% wow"],
        ["Avg rating", "4.6", "stable"],
      ].map(([label, value, delta]) => (
        <div
          key={label}
          className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/70"
        >
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <BarChart3 size={14} aria-hidden /> {label}
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">
            {value}
          </p>
          <p className="text-xs text-slate-500">{delta}</p>
        </div>
      ))}
    </div>
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
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      />
    </Field>
  );
}
