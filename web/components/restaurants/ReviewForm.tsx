"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/lib/restaurants-api";

interface Props {
  restaurantId: string;
}

export function ReviewForm({ restaurantId }: Props) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const m = useMutation({
    mutationFn: () =>
      submitReview({
        restaurant_id: restaurantId,
        rating,
        comment,
        user_name: name,
        user_email: email,
      }),
    onSuccess: () => {
      setDone(true);
      qc.invalidateQueries({ queryKey: ["reviews", restaurantId] });
    },
  });

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        Thanks for the review! We'll send a verification link to{" "}
        <span className="font-medium">{email}</span> — once confirmed, your review
        will appear here.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (m.isPending) return;
        m.mutate();
      }}
      className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200/70"
    >
      <div>
        <h3 className="font-serif text-lg font-semibold text-slate-900">
          Share your experience
        </h3>
        <p className="text-sm text-slate-500">
          We'll email you a one-tap link to verify — no signup needed.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
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
                className="rounded p-1 text-amber-500 hover:scale-110"
              >
                <Star
                  size={22}
                  fill={filled ? "currentColor" : "transparent"}
                  className={filled ? "" : "text-slate-300"}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ananya R."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </Field>
        <Field label="Email (private)">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
        className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto sm:px-6"
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
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
