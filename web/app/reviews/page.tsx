import type { Metadata } from "next";
import { Star } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getReviews } from "@/lib/kibana";
import { KibanaReviewForm } from "./review-form";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "What guests say about dining and hosting events at Kibana Jaipur. Real reviews — leave yours.",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getReviews();
  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const count = reviews.length;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-amber-100 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                Reviews
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold text-[#3B1F1A] sm:text-5xl">
                What people are saying.
              </h1>
              <p className="mt-3 max-w-xl text-[#3B1F1A]/70">
                Honest words from diners and event hosts. We read every one.
              </p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-6 shadow-sm ring-1 ring-amber-900/5">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-5xl font-bold text-[#3B1F1A]">
                  {avg.toFixed(1)}
                </span>
                <span className="text-sm text-[#3B1F1A]/60">/ 5</span>
              </div>
              <div className="mt-1 flex items-center gap-0.5 text-amber-600">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(avg) ? "currentColor" : "transparent"}
                    className={i < Math.round(avg) ? "" : "text-amber-300"}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-[#3B1F1A]/70">
                Based on {count} review{count === 1 ? "" : "s"}.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {reviews.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-amber-200 p-10 text-center text-sm text-[#3B1F1A]/60">
                  No reviews yet — be the first.
                </p>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-900/5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-[#3B1F1A]">
                            {r.user_name}
                          </p>
                          <p className="text-xs text-[#3B1F1A]/50">
                            {new Date(r.created_at).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-600">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              fill={
                                i < Math.round(r.rating)
                                  ? "currentColor"
                                  : "transparent"
                              }
                              className={
                                i < Math.round(r.rating) ? "" : "text-amber-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      {r.title ? (
                        <p className="mt-3 font-serif text-lg font-semibold text-[#3B1F1A]">
                          {r.title}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm leading-relaxed text-[#3B1F1A]/80">
                        {r.comment}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="lg:sticky lg:top-20 lg:self-start">
              <KibanaReviewForm />
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
