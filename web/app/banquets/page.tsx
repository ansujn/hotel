import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BANQUETS } from "@/lib/kibana";
import { BanquetCard3D } from "@/components/kibana/BanquetCard3D";
import { RevealOnScroll } from "@/components/kibana/RevealOnScroll";
import { Ornament } from "@/components/kibana/Ornament";

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
        <section className="kib-burgundy py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="flex justify-center"><Ornament /></div>
            <p className="kib-gold-text mt-6 font-display text-[11px] uppercase tracking-[0.5em]">
              Banquets at Kibana
            </p>
            <h1 className="mt-4 font-display text-5xl font-light leading-tight text-amber-50 sm:text-7xl">
              Halls that hold <span className="kib-shimmer italic">every kind of evening.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-amber-50/75">
              We run five distinct event spaces under one roof — décor, catering,
              photography, valet, live-stream, bridal lounge. One quote, no juggling.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={"/book" as Route}
                className="kib-btn-gold rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
              >
                Request a quote
              </Link>
              <a
                href="tel:+919829012345"
                className="kib-btn-ghost rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
              >
                Call event team
              </a>
            </div>
          </div>
        </section>

        <section className="kib-paper kib-texture-marble py-28">
          <div className="mx-auto max-w-7xl px-6">
            <RevealOnScroll>
              <div className="text-center mb-6">
                <div className="flex justify-center"><Ornament /></div>
                <p className="kib-gold-text font-display text-[11px] uppercase tracking-[0.5em] mt-6">
                  Five Halls
                </p>
                <h2 className="mt-4 font-display text-4xl font-light text-[#3B1F1A] sm:text-5xl">
                  Pick the room. We'll design the night.
                </h2>
              </div>
            </RevealOnScroll>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {BANQUETS.map((b, i) => (
                <BanquetCard3D
                  key={b.id}
                  id={b.id}
                  name={b.name.replace(/^The /, "The ")}
                  blurb={b.blurb}
                  seated={b.capacity.seated}
                  floating={b.capacity.floating}
                  area={b.area_sqft}
                  priceFromInr={b.pricing_per_event}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="kib-paper kib-pattern-damask py-28">
          <div className="mx-auto max-w-7xl px-6">
            <RevealOnScroll>
              <div className="mb-8 flex justify-center"><Ornament /></div>
              <div className="grid gap-10 lg:grid-cols-3">
                <Feature
                  title="Décor that earns the photo"
                  body="Marigold canopies, fresh-flower mandaps, custom typography for every menu — handled in-house."
                />
                <Feature
                  title="A kitchen that scales"
                  body="From 30 plated covers to 500 buffet, our brigade plates within the hour. Live counters available."
                />
                <Feature
                  title="One coordinator, end-to-end"
                  body="A single point of contact for vendors, valet, AV and the bridal suite — so you can be a guest at your own event."
                />
              </div>
            </RevealOnScroll>
          </div>
        </section>

        <section className="kib-burgundy py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
            <div>
              <p className="kib-gold-text font-display text-[11px] uppercase tracking-[0.4em]">
                Need help picking?
              </p>
              <h2 className="mt-3 font-display text-4xl font-light text-amber-50 sm:text-5xl">
                Tell us your guest count. We'll suggest a fit.
              </h2>
              <p className="mt-3 text-sm text-amber-50/70">
                A draft quote within 24 hours — capacity, pricing, and add-ons.
              </p>
            </div>
            <Link
              href={"/book" as Route}
              className="kib-btn-gold rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
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

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="kib-frame bg-white p-8">
      <Ornament />
      <h3 className="mt-5 font-display text-2xl text-[#3B1F1A]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#3B1F1A]/75">{body}</p>
    </div>
  );
}
