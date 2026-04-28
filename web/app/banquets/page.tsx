import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Users, Maximize2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BANQUETS } from "@/lib/kibana";

export const metadata: Metadata = {
  title: "Banquets",
  description:
    "Five Kibana Jaipur banquet halls — from a 36-seat haveli to a 500-guest pillar-free hall. Weddings, receptions, corporate galas.",
};

export default function BanquetsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#3B1F1A] py-14 text-amber-50 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
              Banquets at Kibana
            </p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold sm:text-6xl">
              Halls that hold every kind of evening.
            </h1>
            <p className="mt-4 max-w-2xl text-amber-100/80">
              We run five distinct event spaces under one roof, plus a full
              event team — décor, catering, photography, valet, live-stream,
              and a bridal suite. One quote, no juggling.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={"/book" as Route}
                className="rounded-full bg-amber-50 px-5 py-2.5 text-sm font-semibold text-[#3B1F1A] hover:bg-amber-100"
              >
                Request a quote
              </Link>
              <a
                href="tel:+919829012345"
                className="rounded-full border border-amber-50/40 px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-amber-50/10"
              >
                Call event team
              </a>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6">
            {BANQUETS.map((b, idx) => (
              <article
                key={b.id}
                className="grid gap-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-amber-900/5 sm:p-6 lg:grid-cols-[1.2fr_1fr]"
              >
                <div
                  className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-amber-100 ${idx % 2 ? "lg:order-2" : ""}`}
                >
                  <Image
                    src={b.hero_image}
                    alt={`The ${b.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                    {b.best_for.join(" · ")}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-[#3B1F1A]">
                    The {b.name.replace(/^The /, "")}
                  </h2>
                  <p className="mt-3 text-[#3B1F1A]/75">{b.blurb}</p>

                  <dl className="mt-5 grid grid-cols-3 gap-3">
                    <FactCell
                      icon={<Users size={14} aria-hidden />}
                      label="Seated"
                      value={`${b.capacity.seated}`}
                    />
                    <FactCell
                      icon={<Users size={14} aria-hidden />}
                      label="Floating"
                      value={`${b.capacity.floating}`}
                    />
                    <FactCell
                      icon={<Maximize2 size={14} aria-hidden />}
                      label="Area"
                      value={`${b.area_sqft} ft²`}
                    />
                  </dl>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {b.features.map((f) => (
                      <li
                        key={f}
                        className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-[#3B1F1A]"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                    <p className="text-sm text-[#3B1F1A]/70">
                      From{" "}
                      <span className="font-serif text-xl font-bold text-[#3B1F1A]">
                        ₹{b.pricing_per_event.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs"> / event</span>
                    </p>
                    <Link
                      href={
                        `/book?banquet=${encodeURIComponent(b.id)}` as Route
                      }
                      className="rounded-full bg-[#3B1F1A] px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-[#4d2823]"
                    >
                      Enquire about {b.name.replace(/^The /, "")}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-amber-50 py-14">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 px-4 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#3B1F1A]">
                Need help picking the right hall?
              </h2>
              <p className="mt-2 text-sm text-[#3B1F1A]/70">
                Tell us your guest count and date — we'll suggest the best fit
                and a draft quote within 24 hours.
              </p>
            </div>
            <Link
              href={"/book" as Route}
              className="rounded-full bg-[#3B1F1A] px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-[#4d2823]"
            >
              Start a request
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function FactCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-amber-50 p-3">
      <dt className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
        {icon} {label}
      </dt>
      <dd className="mt-1 font-serif text-lg font-bold text-[#3B1F1A]">
        {value}
      </dd>
    </div>
  );
}
