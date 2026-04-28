import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { Star, MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { VideoGallery } from "@/components/restaurants/VideoGallery";
import { KIBANA, getVideos, getReviews, MENU } from "@/lib/kibana";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [videos, reviews] = await Promise.all([getVideos(), getReviews()]);
  const topReviews = reviews.slice(0, 3);
  const signatureItems = MENU.flatMap((c) =>
    c.items.filter((i) => i.signature).map((i) => ({ ...i, category: c.title })),
  ).slice(0, 4);

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
    priceRange: "₹₹₹",
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Saudagar's Lane · C-Scheme · Jaipur
            </p>
            <h1 className="mt-3 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-[#3B1F1A] sm:text-6xl lg:text-7xl">
              Where the Pink City dines & celebrates.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[#3B1F1A]/70">
              {KIBANA.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={"/book" as Route}
                className="rounded-full bg-[#3B1F1A] px-6 py-3 text-sm font-semibold text-amber-50 transition hover:bg-[#4d2823]"
              >
                Reserve a table
              </Link>
              <Link
                href={"/banquets" as Route}
                className="rounded-full border border-[#3B1F1A]/20 bg-white px-6 py-3 text-sm font-semibold text-[#3B1F1A] hover:bg-amber-50"
              >
                Plan an event →
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-amber-200/60 pt-6 text-sm">
              <Stat label="Years in Jaipur" value="12" />
              <Stat label="Banquet halls" value="5" />
              <Stat label="Avg. rating" value="4.7★" />
            </dl>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-amber-100 shadow-xl ring-1 ring-amber-900/10">
            <Image
              src={KIBANA.hero_image}
              alt="Kibana Jaipur rooftop at sunset"
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3B1F1A]/85 via-[#3B1F1A]/30 to-transparent p-6 text-amber-50">
              <p className="font-serif text-2xl font-semibold">The Rooftop</p>
              <p className="text-sm text-amber-100/80">
                Sweeping skyline · sunset terrace · custom cocktails
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured videos */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            kicker="Watch"
            title="Inside Kibana"
            blurb="Step onto the rooftop, into the kitchen, and through a wedding night."
            link={{ href: "/gallery" as Route, label: "Full gallery →" }}
          />
          <div className="mt-8">
            <VideoGallery videos={videos.map((v) => ({
              id: v.id,
              title: v.title,
              type: (["ambiance", "chef", "menu", "event"].includes(v.type) ? v.type : "ambiance") as "ambiance" | "chef" | "menu" | "event",
              mux_playback_id: v.mux_playback_id,
              thumbnail_url: v.thumbnail_url,
              duration_s: v.duration_s,
              views: v.views,
            }))} />
          </div>
        </div>
      </section>

      {/* Signature dishes */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            kicker="Signatures"
            title="Dishes worth driving across town for"
            blurb="A few of the plates our regulars order without thinking."
            link={{ href: "/menu" as Route, label: "View full menu →" }}
          />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {signatureItems.map((d) => (
              <li
                key={d.name}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-900/5 transition hover:shadow-lg"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  {d.category}
                </p>
                <p className="mt-2 font-serif text-xl font-semibold text-[#3B1F1A]">
                  {d.name}
                </p>
                <p className="mt-2 text-sm text-[#3B1F1A]/70">{d.description}</p>
                <p className="mt-3 text-sm font-semibold text-[#3B1F1A]">
                  ₹{d.price}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Banquets teaser */}
      <section className="bg-[#3B1F1A] py-20 text-amber-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
              Banquets
            </p>
            <h2 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
              Five halls. One unforgettable evening.
            </h2>
            <p className="mt-4 max-w-lg text-amber-100/80">
              From a 36-seat haveli to a 500-guest pillar-free hall, our event
              team designs every detail — décor, catering, photography, valet.
            </p>
            <Link
              href={"/banquets" as Route}
              className="mt-6 inline-flex rounded-full bg-amber-50 px-5 py-2.5 text-sm font-semibold text-[#3B1F1A] hover:bg-amber-100"
            >
              Tour the halls
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Saffron Grand", "Courtyard", "Rooftop", "Haveli"].map((h, i) => (
              <div
                key={h}
                className={`relative aspect-square overflow-hidden rounded-2xl bg-amber-100/10 ring-1 ring-amber-50/10 ${i % 2 ? "translate-y-6" : ""}`}
              >
                <Image
                  src="/images/kibana-jaipur/banquets/placeholder.svg"
                  alt={`The ${h}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 280px"
                  className="object-cover opacity-80 transition hover:opacity-100"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-[#3B1F1A]/80 px-2 py-1 text-xs font-medium text-amber-50">
                  The {h}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            kicker="Guestbook"
            title="What people say"
            link={{ href: "/reviews" as Route, label: "Read all reviews →" }}
          />
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {topReviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5"
              >
                <div className="flex items-center gap-1 text-amber-600">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.round(r.rating) ? "currentColor" : "transparent"}
                      className={i < Math.round(r.rating) ? "" : "text-amber-300"}
                    />
                  ))}
                </div>
                {r.title ? (
                  <p className="mt-3 font-serif text-lg font-semibold">
                    {r.title}
                  </p>
                ) : null}
                <p className="mt-2 text-sm leading-relaxed text-[#3B1F1A]/80">
                  {r.comment}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#3B1F1A]/60">
                  — {r.user_name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-amber-50 py-14">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#3B1F1A]">
              See you at the table.
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#3B1F1A]/70">
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
              className="rounded-full bg-[#3B1F1A] px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-[#4d2823]"
            >
              Reserve
            </Link>
            <a
              href={`tel:${KIBANA.phone.replace(/\s+/g, "")}`}
              className="rounded-full border border-[#3B1F1A]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#3B1F1A] hover:bg-amber-50"
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
    <div>
      <dt className="text-xs uppercase tracking-wide text-[#3B1F1A]/60">
        {label}
      </dt>
      <dd className="mt-1 font-serif text-2xl font-bold">{value}</dd>
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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
          {kicker}
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold text-[#3B1F1A] sm:text-4xl">
          {title}
        </h2>
        {blurb ? (
          <p className="mt-2 max-w-xl text-[#3B1F1A]/70">{blurb}</p>
        ) : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="text-sm font-semibold text-amber-700 hover:text-[#3B1F1A]"
        >
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}
