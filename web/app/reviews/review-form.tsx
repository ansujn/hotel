"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/lib/kibana";

export function KibanaReviewForm() {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const m = useMutation({
    mutationFn: () =>
      submitReview({
        rating,
        comment,
        title: title || undefined,
        user_name: name,
        user_email: email,
      }),
    onSuccess: () => setDone(true),
  });

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        Thanks for the review — we'll send a one-tap verification link to{" "}
        <span className="font-medium">{email}</span>. Once confirmed, your
        review appears on this page.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!m.isPending) m.mutate();
      }}
      className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5"
    >
      <div>
        <h3 className="font-serif text-xl font-semibold text-[#3B1F1A]">
          Leave a review
        </h3>
        <p className="text-sm text-[#3B1F1A]/60">
          We email a one-tap verify link — no signup needed.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#3B1F1A]/60">
          Rating
        </label>
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((v) => {
            const filled = v <= (hover || rating);
            return (
              <button
                key={v}
                type="button"
                onClick={() => setRating(v)}
                onMouseEnter={() => setHover(v)}
                onMouseLeave={() => setHover(0)}
                aria-label={`Rate ${v} of 5`}
                className="rounded p-1 text-amber-600 hover:scale-110"
              >
                <Star
                  size={22}
                  fill={filled ? "currentColor" : "transparent"}
                  className={filled ? "" : "text-amber-300"}
                />
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Headline (optional)">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Best rooftop in the city"
          className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
          />
        </Field>
        <Field label="Email (private)">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
          />
        </Field>
      </div>

      <Field label="Review">
        <textarea
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          minLength={10}
          maxLength={1000}
          rows={4}
          placeholder="What did you order? How was the vibe?"
          className="w-full resize-y rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm focus:border-[#3B1F1A] focus:outline-none focus:ring-1 focus:ring-[#3B1F1A]"
        />
      </Field>

      {m.error ? (
        <p className="text-sm text-red-600">
          Couldn't submit — please try again.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={m.isPending}
        className="w-full rounded-xl bg-[#3B1F1A] py-2.5 text-sm font-semibold text-amber-50 hover:bg-[#4d2823] disabled:opacity-50"
      >
        {m.isPending ? "Submitting…" : "Post review"}
      </button>
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
