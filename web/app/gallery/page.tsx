import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { VideoGallery } from "@/components/restaurants/VideoGallery";
import { getImages, getVideos } from "@/lib/kibana";
import { Ornament } from "@/components/kibana/Ornament";
import { RevealOnScroll } from "@/components/kibana/RevealOnScroll";
import { GalleryClient } from "@/components/kibana/GalleryClient";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos and videos from inside Kibana Jaipur — rooftop, kitchen, dishes, and event nights.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const [images, videos] = await Promise.all([getImages(), getVideos()]);

  return (
    <>
      <SiteHeader />
      <main>
        {/* Cinematic intro with looping hero video as backdrop */}
        <section className="relative h-[60svh] min-h-[420px] overflow-hidden bg-[#1A0F0D]">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          >
            <source src="/videos/kibana-hero.mp4" type="video/mp4" />
          </video>
          <div className="kib-cinema-overlay absolute inset-0" aria-hidden />
          <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
            <Ornament />
            <p className="kib-gold-text mt-5 font-display text-[11px] uppercase tracking-[0.5em]">
              Gallery
            </p>
            <h1 className="mt-3 font-display text-5xl font-light leading-tight text-amber-50 sm:text-7xl">
              Photos & films <span className="kib-shimmer italic">from Kibana.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-amber-50/75">
              Sunsets on the rooftop. Plate-ups in the kitchen. The swirl of a sangeet.
            </p>
          </div>
        </section>

        {/* Films */}
        <section className="kib-paper py-24">
          <div className="mx-auto max-w-7xl px-6">
            <RevealOnScroll>
              <div className="text-center">
                <p className="kib-gold-text font-display text-[11px] uppercase tracking-[0.5em]">
                  Films
                </p>
                <h2 className="mt-3 font-display text-4xl font-light text-[#3B1F1A] sm:text-5xl">
                  Tap any reel to play.
                </h2>
                <div className="mt-5 flex justify-center"><Ornament /></div>
              </div>
            </RevealOnScroll>
            <div className="mt-12">
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

        {/* Photos */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <RevealOnScroll>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="kib-gold-text font-display text-[11px] uppercase tracking-[0.5em]">
                    Photos
                  </p>
                  <h2 className="mt-3 font-display text-4xl font-light text-[#3B1F1A] sm:text-5xl">
                    A few moments, captured.
                  </h2>
                </div>
              </div>
            </RevealOnScroll>

            <GalleryClient images={images} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
