"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface FeaturedPiece {
  title: string;
  tag: string; // e.g. "MONOLOGUE"
  year: string;
  accentA: string;
  accentB: string;
}

interface Props {
  pieces: FeaturedPiece[];
}

/**
 * "Now Playing" — tiny poster strip that hints at the kind of work students
 * produce. Gradient placeholders (we don't have public-ready assets yet).
 * TODO: swap in real Mux thumbnails once consented work is live.
 */
export function FeaturedReel({ pieces }: Props) {
  const reduce = useReducedMotion();
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {pieces.map((p, i) => (
        <motion.div
          key={p.title}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: i * 0.07 }}
          className="group relative overflow-hidden rounded-xl border border-[#2A2A36]"
          style={{ aspectRatio: "3 / 4" }}
        >
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${p.accentA}55, transparent 55%), linear-gradient(160deg, ${p.accentA} 0%, ${p.accentB} 100%)`,
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.75) 100%)",
            }}
          />
          {/* Paper texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.2] mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "5px 5px",
            }}
          />
          <div className="absolute left-3 top-3 text-[9px] tracking-[0.35em] text-black/70 bg-[#E8C872] rounded px-1.5 py-0.5">
            {p.tag}
          </div>
          <div className="absolute inset-x-3 bottom-3 text-white">
            <div className="serif text-sm md:text-base font-black leading-tight">
              {p.title}
            </div>
            <div className="text-[10px] tracking-[0.3em] text-white/70 mt-1">
              VIK · {p.year}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
