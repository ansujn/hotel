import Image from "next/image";
import Link from "next/link";
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { Phone, MapPin, Globe, Clock, Star, Users } from "lucide-react";
import { getRestaurant } from "@/lib/restaurants-api";
import { VideoGallery } from "@/components/restaurants/VideoGallery";
import { ImageCarousel } from "@/components/restaurants/ImageCarousel";
import { ReviewsList } from "@/components/restaurants/ReviewsList";
import { ReviewForm } from "@/components/restaurants/ReviewForm";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const r = await getRestaurant(id);
    return {
      title: r.name,
      description: r.description.slice(0, 160),
      openGraph: {
        title: r.name,
        description: r.description.slice(0, 160),
        images: [r.hero_image_url],
        type: "website",
      },
    };
  } catch {
    return { title: "Restaurant" };
  }
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { id } = await params;
  let r;
  try {
    r = await getRestaurant(id);
  } catch {
    notFound();
  }

  const ld = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    image: [r.hero_image_url, ...r.images.map((i) => i.url)],
    description: r.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: r.address,
      addressLocality: r.city,
    },
    telephone: r.phone,
    url: r.website,
    servesCuisine: r.cuisine,
    priceRange: "₹".repeat(Math.min(4, Math.ceil(r.avg_price_per_plate / 600))),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: r.avg_rating,
      reviewCount: r.review_count,
    },
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-slate-500">
        <Link href={"/restaurants" as Route} className="hover:text-slate-900">
          Discover
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-700">{r.name}</span>
      </nav>

      {/* Hero */}
      <header className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200/70">
          <Image
            src={r.hero_image_url}
            alt={r.name}
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-sm uppercase tracking-wide text-slate-500">
            {r.cuisine.join(" · ")}
          </p>
          <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {r.name}
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-600">{r.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star size={16} fill="currentColor" aria-hidden />
              <span className="font-semibold text-slate-900">
                {r.avg_rating.toFixed(1)}
              </span>
              <span className="text-slate-500">({r.review_count})</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <MapPin size={14} aria-hidden /> {r.location}, {r.city}
            </span>
            <span className="text-slate-900">
              ₹{r.avg_price_per_plate}
              <span className="text-slate-400">/plate</span>
            </span>
          </div>
          {r.highlights.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {r.highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {h}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      {/* Content + Sidebar */}
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-12">
          {/* Videos */}
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-slate-900">
              Watch
            </h2>
            <VideoGallery videos={r.videos} />
          </section>

          {/* Photos */}
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-slate-900">
              Photos
            </h2>
            <ImageCarousel images={r.images} />
          </section>

          {/* Reviews */}
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-slate-900">
              Reviews
            </h2>
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <ReviewsList restaurantId={r.id} />
              <ReviewForm restaurantId={r.id} />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200/70">
            <InfoRow icon={<MapPin size={14} />} label="Address">
              {r.address}
            </InfoRow>
            <InfoRow icon={<Phone size={14} />} label="Phone">
              <a
                href={`tel:${r.phone.replace(/\s+/g, "")}`}
                className="hover:underline"
              >
                {r.phone}
              </a>
            </InfoRow>
            {r.website ? (
              <InfoRow icon={<Globe size={14} />} label="Website">
                <a
                  href={r.website}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all hover:underline"
                >
                  {r.website.replace(/^https?:\/\//, "")}
                </a>
              </InfoRow>
            ) : null}
            <InfoRow icon={<Users size={14} />} label="Capacity">
              Seats {r.capacity}
            </InfoRow>
          </div>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/70">
            <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Clock size={14} aria-hidden /> Hours
            </h3>
            <ul className="space-y-1.5 text-sm">
              {Object.entries(r.hours).map(([day, h]) => (
                <li
                  key={day}
                  className="flex items-center justify-between gap-3 text-slate-700"
                >
                  <span className="font-medium text-slate-900">{day}</span>
                  <span className={h ? "" : "text-slate-400"}>
                    {h ? `${h.open} – ${h.close}` : "Closed"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon} {label}
      </span>
      <span className="text-sm text-slate-700">{children}</span>
    </div>
  );
}
