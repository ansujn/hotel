"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { listReviews, type Review } from "@/lib/restaurants-api";

const PAGE_SIZE = 10;

export function ReviewsList({ restaurantId }: { restaurantId: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["reviews", restaurantId],
      queryFn: ({ pageParam = 1 }) =>
        listReviews(restaurantId, pageParam as number, PAGE_SIZE),
      initialPageParam: 1,
      getNextPageParam: (last, all) =>
        last.has_more ? all.length + 1 : undefined,
    });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading reviews…</p>;
  }

  const all: Review[] = data?.pages.flatMap((p) => p.reviews) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (all.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        No reviews yet — be the first to share your experience.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        {total} review{total === 1 ? "" : "s"}
      </p>
      <ul className="space-y-3">
        {all.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">{r.user_name}</p>
                <p className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Stars rating={r.rating} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {r.comment}
            </p>
            {r.owner_response ? (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Owner response
                </p>
                <p className="mt-1">{r.owner_response}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {hasNextPage ? (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5 text-amber-500"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          fill={i <= rating ? "currentColor" : "transparent"}
          className={i <= rating ? "" : "text-slate-300"}
        />
      ))}
    </div>
  );
}
