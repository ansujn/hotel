import Link from "next/link";
import type { Route } from "next";
import { Star, MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroVideo } from "@/components/kibana/HeroVideo";
import { BanquetCard3D } from "@/components/kibana/BanquetCard3D";
import { RevealOnScroll } from "@/components/kibana/RevealOnScroll";
import { Ornament } from "@/components/kibana/Ornament";
import { KIBANA, getReviews, MENU, BANQUETS } from "@/lib/kibana";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const reviews = await getReviews();
  const topReviews = reviews.slice(0, 3);
  const signatureItems = MENU.flatMap((c) =>
    c.items.filter((i) => i.signature).map((i) => ({ ...i, category: c.title })),
  ).slice(0, 4);
  const featuredBanquets = BANQUETS.slice(0, 4);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: KIBANA.name,
    description: KIBANA.description,
    image: [KIBANA.hero_image],
    address: {
      "@type": "PostalAddress",
      streetAddress: KIBANA.address,
      addressLocality: KIBANA.city,
      addressCountry: "IN",
    },
    telephone: KIBANA.phone,
    email: KIBANA.email,
    url: KIBANA.website,
    servesCuisine: KIBANA.cuisine,
    priceRange: "₹₹₹₹",
    openingHours: Object.entries(KIBANA.hours)
      .filter(([, h]) => h)
      .map(([d, h]) => `${d.slice(0, 2)} ${h?.open}-${h?.close}`),
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* ───── Cinematic Hero ──────────────────────────────────────── */}
      <HeroVideo videoSrc="/videos/kibana-hero.mp4" />

      {/* ───── Manifesto strip ─────────────────────────────────────── */}
      <section className="kib-paper border-y border-[#D4AF37]/15 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <RevealOnScroll>
            <div className="flex justify-center"><Ornament /></div>
            <p className="mt-6 font-display text-3xl italic leading-snug text-[#3B1F1A] sm:text-4xl">
              "Where the sun sets twice — once on the horizon, and again on
              every plate that leaves our kitchen."
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.4em] text-[#D4AF37]">
              Est. 2014 · Saudagar's Lane · Jaipur
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ───── Stats ───────────────────────────────────────────────── */}
      <section className="kib-paper py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 sm:grid-cols-4">
          <Stat label="Years in Jaipur" value="12" />
          <Stat label="Banquet halls" value="05" />
          <Stat label="Avg. rating" value="4.7★" />
          <Stat label="Plates / night" value="600+" />
        </div>
      </section>

      {/* ───── Signature dishes ────────────────────────────────────── */}
      <section className="kib-paper py-24">
        <div className="mx-auto max-w-7xl px-6">
          <RevealOnScroll>
            <SectionHead
              kicker="The Signatures"
              title="Plates worth driving across town for"
              blurb="A few dishes our regulars order without thinking — and a few we keep on the menu by popular demand."
              link={{ href: "/menu" as Route, label: "View full menu →" }}
            />
          </RevealOnScroll>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {signatureItems.map((d, i) => (
              <li key={d.name}>
                <RevealOnScroll delay={i * 0.08}>
                  <article className="kib-frame group relative aspect-[4/5] flex flex-col bg-gradient-to-br from-[#FBF8F1] via-[#F3EBD7] to-[#E9DDB6] p-7 transition-transform duration-700 hover:-translate-y-1">
                    <p className="kib-gold-text font-display text-[10px] uppercase tracking-[0.4em]">
                      {d.category}
                    </p>
                    <h3 className="mt-4 font-display text-2xl leading-tight text-[#3B1F1A]">
                      {d.name}
                    </h3>
                    <div className="kib-rule my-4" />
                    <p className="text-sm leading-relaxed text-[#3B1F1A]/75">
                      {d.description}
                    </p>
                    <p className="kib-shimmer mt-auto pt-6 font-display text-3xl">
                      ₹{d.price}
                    </p>
                  </article>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── Banquets — premium 3D-tilt cards ────────────────────── */}
      <section className="kib-burgundy py-28">
        <div className="mx-auto max-w-7xl px-6">
          <RevealOnScroll>
            <div className="text-center">
              <div className="flex justify-center"><Ornament /></div>
              <p className="kib-gold-text mt-6 font-display text-[11px] uppercase tracking-[0.5em]">
                Banquets at Kibana
              </p>
              <h2 className="mt-4 font-display text-5xl font-light leading-tight text-amber-50 sm:text-7xl">
                Five halls. <span className="kib-shimmer italic">One unforgettable evening.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-amber-50/70">
                From a 36-seat haveli to a 500-guest pillar-free hall, our
                event team designs every detail — décor, catering, photography,
                valet, and a bridal lounge built for the moment.
              </p>
            </div>
          </RevealOnScroll>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBanquets.map((b, i) => (
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

          <div className="mt-12 flex justify-center">
            <Link
              href={"/banquets" as Route}
              className="kib-btn-gold rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Tour all five halls
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Testimonials ────────────────────────────────────────── */}
      <section className="kib-paper py-24">
        <div className="mx-auto max-w-7xl px-6">
          <RevealOnScroll>
            <SectionHead
              kicker="The Guestbook"
              title="What people say"
              link={{ href: "/reviews" as Route, label: "Read all reviews →" }}
            />
          </RevealOnScroll>

          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {topReviews.map((r, i) => (
              <li key={r.id}>
                <RevealOnScroll delay={i * 0.1}>
                  <article className="kib-frame relative flex h-full flex-col bg-white p-8">
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star
                          key={k}
                          size={14}
                          fill={k < Math.round(r.rating) ? "currentColor" : "transparent"}
                          className={k < Math.round(r.rating) ? "" : "text-[#D4AF37]/30"}
                        />
                      ))}
                    </div>
                    {r.title ? (
                      <p className="mt-4 font-display text-xl text-[#3B1F1A]">
                        "{r.title}"
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm leading-relaxed text-[#3B1F1A]/75">
                      {r.comment}
                    </p>
                    <div className="kib-rule my-5" />
                    <p className="mt-auto text-[10px] font-semibold uppercase tracking-[0.3em] text-[#3B1F1A]/60">
                      — {r.user_name}
                    </p>
                  </article>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── Bottom CTA ──────────────────────────────────────────── */}
      <section className="kib-burgundy py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div>
            <p className="kib-gold-text font-display text-[11px] uppercase tracking-[0.4em]">
              Reserve
            </p>
            <h2 className="mt-3 font-display text-4xl font-light text-amber-50 sm:text-5xl">
              See you at the table.
            </h2>
            <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-amber-50/70">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} aria-hidden /> {KIBANA.city}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone size={14} aria-hidden /> {KIBANA.phone}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={"/book" as Route}
              className="kib-btn-gold rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Reserve
            </Link>
            <a
              href={`tel:${KIBANA.phone.replace(/\s+/g, "")}`}
              className="kib-btn-ghost rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Call us
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <dd className="kib-shimmer font-display text-5xl font-light leading-none">
        {value}
      </dd>
      <dt className="mt-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#3B1F1A]/55">
        {label}
      </dt>
    </div>
  );
}

function SectionHead({
  kicker,
  title,
  blurb,
  link,
}: {
  kicker: string;
  title: string;
  blurb?: string;
  link?: { href: Route; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="kib-gold-text font-display text-[11px] uppercase tracking-[0.5em]">
          {kicker}
        </p>
        <h2 className="mt-4 font-display text-4xl font-light text-[#3B1F1A] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        {blurb ? (
          <p className="mt-4 max-w-xl text-[#3B1F1A]/70">{blurb}</p>
        ) : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37] hover:text-[#3B1F1A]"
        >
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}
