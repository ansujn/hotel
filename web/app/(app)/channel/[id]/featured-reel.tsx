"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion, useReducedMotion } from "framer-motion";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { formatDuration, type Asset } from "@/lib/channel";

interface Props {
  asset: Asset;
  href: string;
}

export function FeaturedReel({ asset, href }: Props) {
  const reduced = useReducedMotion();
  const thumb = asset.mux_playback_id
    ? `https://image.mux.com/${asset.mux_playback_id}/thumbnail.jpg?width=1280&height=720&fit_mode=smartcrop`
    : undefined;

  const typeLabel =
    asset.type === "monologue"
      ? "Monologue"
      : asset.type === "scene"
      ? "Scene"
      : asset.type === "showcase"
      ? "Showcase"
      : "Catalog";

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="max-w-6xl mx-auto px-6 md:px-8 mt-10"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-[1px] w-8 bg-[#E8C872]" />
        <div className="text-[10px] tracking-[0.4em] text-[#E8C872] uppercase">
          Featured Reel
        </div>
      </div>

      <Link
        href={href as Route}
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60 rounded-2xl"
        aria-label={`Play featured piece: ${asset.title}`}
      >
        <article className="relative overflow-hidden rounded-2xl border border-[#2A2A36] bg-[#15151C] hover:border-[#E8C872]/50 transition-colors">
          <div className="grid md:grid-cols-[1.6fr_1fr]">
            <div className="relative aspect-video md:aspect-auto md:min-h-[360px] bg-[#0B0B0F] overflow-hidden">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt={asset.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,0.55), rgba(232,200,114,0.45))",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#E8C872] text-black grid place-items-center shadow-[0_20px_60px_-15px_rgba(232,200,114,0.8)] group-hover:scale-110 transition-transform">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 ml-1"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 text-xs font-mono bg-black/70 text-white px-2 py-1 rounded">
                {formatDuration(asset.duration_s)}
              </div>
              <div className="absolute top-3 left-3">
                <PrivacyBadge privacy={asset.privacy} />
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-[#15151C] via-[#15151C] to-[#1a1030]/40">
              <div>
                <div className="text-[10px] tracking-[0.35em] text-[#8A8A96] uppercase">
                  {typeLabel} · Latest
                </div>
                <h2 className="serif text-2xl md:text-3xl font-black mt-3 leading-tight group-hover:text-[#E8C872] transition-colors">
                  {asset.title}
                </h2>
                {asset.note && (
                  <p className="mt-4 text-sm text-[#C9C9D1] leading-relaxed line-clamp-4 italic">
                    &ldquo;{asset.note}&rdquo;
                  </p>
                )}
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-[#E8C872] font-semibold">
                Watch the performance
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.section>
  );
}
