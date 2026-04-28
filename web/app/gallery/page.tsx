import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { VideoGallery } from "@/components/restaurants/VideoGallery";
import { getImages, getVideos } from "@/lib/kibana";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos and videos from inside Kibana Jaipur — rooftop, kitchen, dishes, and event nights.",
};

export const dynamic = "force-dynamic";

const TABS = [
  { id: "all", label: "All" },
  { id: "interior", label: "Interior" },
  { id: "dish", label: "Food" },
  { id: "event", label: "Events" },
  { id: "hero", label: "Rooftop" },
];

export default async function GalleryPage() {
  const [images, videos] = await Promise.all([getImages(), getVideos()]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-amber-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Gallery
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-[#3B1F1A] sm:text-5xl">
              Photos & films from Kibana.
            </h1>
            <p className="mt-3 max-w-2xl text-[#3B1F1A]/70">
              A few moments captured through the seasons — sunsets on the
              rooftop, plate-ups in the kitchen, the swirl of a sangeet.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-serif text-2xl font-bold text-[#3B1F1A]">
              Films
            </h2>
            <p className="mt-1 text-sm text-[#3B1F1A]/70">
              Tap any reel to play.
            </p>
            <div className="mt-6">
              <VideoGallery
                videos={videos.map((v) => ({
                  id: v.id,
                  title: v.title,
                  type: (
                    ["ambiance", "chef", "menu", "event"].includes(v.type)
                      ? v.type
                      : "ambiance"
                  ) as "ambiance" | "chef" | "menu" | "event",
                  mux_playback_id: v.mux_playback_id,
                  thumbnail_url: v.thumbnail_url,
                  duration_s: v.duration_s,
                  views: v.views,
                }))}
              />
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-serif text-2xl font-bold text-[#3B1F1A]">
                Photos
              </h2>
              <ul className="flex flex-wrap gap-2 text-xs">
                {TABS.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-full bg-amber-50 px-3 py-1 font-medium text-[#3B1F1A]"
                  >
                    {t.label}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img, i) => (
                <li
                  key={img.id}
                  className={`relative overflow-hidden rounded-2xl bg-amber-100 ring-1 ring-amber-900/5 ${
                    i % 5 === 0 ? "row-span-2 sm:col-span-2" : ""
                  }`}
                  style={{
                    aspectRatio: i % 5 === 0 ? "1 / 1" : "4 / 5",
                  }}
                >
                  <Image
                    src={img.url}
                    alt={img.caption ?? "Kibana Jaipur"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                  {img.caption ? (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3B1F1A]/85 to-transparent p-3 text-xs text-amber-50">
                      {img.caption}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
