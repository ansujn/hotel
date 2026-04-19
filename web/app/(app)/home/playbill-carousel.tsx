"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRef, useState } from "react";
import type { Asset } from "@/lib/api";

interface PlaybillCarouselProps {
  studentId: string;
  assets: Asset[];
}

/**
 * Playbill-style horizontal carousel. Each card is a faux theatre poster with
 * a Mux thumbnail backdrop, privacy ribbon, title, and a gold hover glow.
 * Mobile: becomes a native horizontal-swipe scroller (scroll-snap).
 */
export function PlaybillCarousel({ studentId, assets }: PlaybillCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLAnchorElement>("[data-playbill]");
    const step = card ? card.offsetWidth + 20 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[10px] tracking-[0.35em] text-[#E8C872]/80 mb-1">
            NOW SHOWING
          </div>
          <h3 className="serif text-2xl font-black">Your Playbill</h3>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/channel/${studentId}` as Route}
            className="text-xs tracking-widest text-[#8A8A96] hover:text-[#E8C872] transition-colors"
          >
            ALL WORK →
          </Link>
          <div className="hidden md:flex items-center gap-1 ml-3">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scroll(-1)}
              className="h-9 w-9 rounded-full border border-[#2A2A36] bg-[#15151C] text-[#C9C9D1] hover:text-white hover:border-[#E8C872]/50 transition-colors grid place-items-center"
            >
              <span aria-hidden>←</span>
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scroll(1)}
              className="h-9 w-9 rounded-full border border-[#2A2A36] bg-[#15151C] text-[#C9C9D1] hover:text-white hover:border-[#E8C872]/50 transition-colors grid place-items-center"
            >
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto pb-5 snap-x snap-mandatory scroll-smooth"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {assets.map((a, i) => (
          <PosterCard
            key={a.id}
            studentId={studentId}
            asset={a}
            index={i}
            total={assets.length}
          />
        ))}
      </div>
    </div>
  );
}

function PosterCard({
  studentId,
  asset,
  index,
  total,
}: {
  studentId: string;
  asset: Asset;
  index: number;
  total: number;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLAnchorElement | null>(null);

  const thumb = asset.mux_playback_id
    ? `https://image.mux.com/${asset.mux_playback_id}/thumbnail.webp?width=640&fit_mode=preserve`
    : null;

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 5).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 7).toFixed(2)}deg`);
  };

  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
    setHovered(false);
  };

  const dateLabel = new Date(asset.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  const typeLabel =
    asset.type === "scene"
      ? "SCENE"
      : asset.type === "showcase"
        ? "SHOWCASE"
        : asset.type === "catalog"
          ? "CATALOG"
          : "MONOLOGUE";

  const privacyLabel =
    asset.privacy === "public"
      ? "PUBLIC"
      : asset.privacy === "pending_consent"
        ? "PENDING"
        : "PRIVATE";

  return (
    <Link
      ref={ref}
      href={`/channel/${studentId}/v/${asset.id}` as Route}
      data-playbill
      aria-label={`Open "${asset.title}" — ${typeLabel.toLowerCase()} from ${dateLabel}`}
      className="group relative shrink-0 w-[260px] sm:w-[300px] snap-start rounded-2xl border border-[#2A2A36] bg-[#120712] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/70"
      style={{
        aspectRatio: "3 / 4",
        transformStyle: "preserve-3d",
        transform:
          "perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        transition: "transform 220ms ease-out, border-color 200ms ease-out",
      }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        {thumb ? (
          // biome-ignore lint: using raw img is fine here for perf + simplicity
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${
                ["#2a0d20", "#1a0a28", "#2a1810"][index % 3]
              } 0%, #0B0B0F 80%), radial-gradient(circle at 30% 30%, rgba(232,200,114,0.25), transparent 60%)`,
            }}
          />
        )}
      </div>

      {/* Gradient + paper vignette */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Gold frame on hover */}
      <div
        aria-hidden
        className="absolute inset-2 rounded-xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          boxShadow:
            "inset 0 0 0 1px rgba(232,200,114,0.65), 0 0 40px rgba(232,200,114,0.25)",
        }}
      />

      {/* Top ribbons */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
        <span className="text-[10px] tracking-[0.3em] text-[#E8C872] bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          {typeLabel}
        </span>
        <span className="text-[9px] tracking-[0.25em] text-[#C9C9D1] bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          {privacyLabel}
        </span>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className="text-[10px] tracking-[0.3em] text-[#E8C872]/80 mb-1">
          NO. {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
        <div className="serif text-lg font-bold leading-tight line-clamp-2">
          {asset.title}
        </div>
        <div className="mt-2 text-[11px] text-[#8A8A96]">
          {dateLabel}
          {asset.duration_s ? ` · ${Math.round(asset.duration_s / 60)} min` : ""}
        </div>
      </div>

      {/* Center play glyph on hover */}
      <div
        aria-hidden
        className="absolute inset-0 grid place-items-center z-10 pointer-events-none transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <div
          className="h-14 w-14 rounded-full grid place-items-center"
          style={{
            background: "rgba(232,200,114,0.95)",
            boxShadow: "0 0 40px rgba(232,200,114,0.6)",
          }}
        >
          <span
            aria-hidden
            className="text-black"
            style={{
              width: 0,
              height: 0,
              borderLeft: "12px solid #000",
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              marginLeft: 3,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
