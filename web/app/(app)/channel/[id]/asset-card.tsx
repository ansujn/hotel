"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion, useReducedMotion } from "framer-motion";
import type { MouseEvent } from "react";
import { useRef, useState } from "react";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { formatDuration, type Asset } from "@/lib/channel";

interface Props {
  asset: Asset;
  href: string;
  canScore?: boolean;
  scoreHref?: string;
}

const TYPE_LABELS: Record<Asset["type"], string> = {
  monologue: "Monologue",
  scene: "Scene",
  showcase: "Showcase",
  catalog: "Catalog",
};

export function AssetCard({ asset, href, canScore, scoreHref }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const thumb = asset.mux_playback_id
    ? `https://image.mux.com/${asset.mux_playback_id}/thumbnail.jpg?width=800&height=450&fit_mode=smartcrop`
    : undefined;

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduced) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (0.5 - y) * 6, ry: (x - 0.5) * 8 });
  };

  const handleLeave = () => setTilt({ rx: 0, ry: 0 });

  const created = asset.created_at
    ? new Date(asset.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <motion.div
      layout
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: 8 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="[perspective:1200px]"
    >
      <Link
        ref={ref}
        href={href as Route}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        aria-label={`Open ${asset.title}`}
        className="group relative block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/70"
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-[#2A2A36] bg-[#15151C] transition-[border-color,box-shadow] duration-300 group-hover:border-[#E8C872]/60 group-focus-visible:border-[#E8C872]/60 group-hover:shadow-[0_30px_80px_-30px_rgba(232,200,114,0.45)]"
          style={{
            transform: reduced
              ? undefined
              : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: "transform 180ms ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Poster thumbnail */}
          <div className="relative aspect-video bg-[#0B0B0F] overflow-hidden">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumb}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.5), rgba(232,200,114,0.35))",
                }}
              />
            )}

            {/* Poster gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            {/* Gold border glow on hover */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(600px 300px at 50% 100%, rgba(232,200,114,0.18), transparent 60%)",
              }}
            />

            {/* Privacy + duration */}
            <div className="absolute top-3 left-3">
              <PrivacyBadge privacy={asset.privacy} />
            </div>
            <div className="absolute top-3 right-3 text-[11px] font-mono bg-black/75 text-white px-2 py-0.5 rounded">
              {formatDuration(asset.duration_s)}
            </div>

            {/* Title on poster */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
              <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-1">
                {TYPE_LABELS[asset.type]}
              </div>
              <h3 className="serif text-lg md:text-xl font-black leading-tight line-clamp-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {asset.title}
              </h3>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-[#2A2A36]/60">
            <div className="text-xs text-[#8A8A96]">{created ?? "—"}</div>
            {canScore && scoreHref ? (
              <Link
                href={scoreHref as Route}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] tracking-[0.25em] uppercase text-[#8B5CF6] hover:text-[#B89BFB]"
                aria-label={`Score rubric for ${asset.title}`}
              >
                Score →
              </Link>
            ) : (
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8A96] group-hover:text-[#E8C872] transition-colors">
                View →
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
