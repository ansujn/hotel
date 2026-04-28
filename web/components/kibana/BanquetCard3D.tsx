"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MouseEvent } from "react";
import Link from "next/link";
import type { Route } from "next";

interface Props {
  id: string;
  name: string;
  blurb: string;
  seated: number;
  floating: number;
  area: number;
  priceFromInr: number;
  index: number;
}

/**
 * 3D-tilt card with parallax inner layers. Pure CSS 3D + Framer springs —
 * cheaper than a WebGL canvas per-card and matches the cinematic style.
 */
export function BanquetCard3D(props: Props) {
  const { id, name, blurb, seated, floating, area, priceFromInr, index } = props;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 180, damping: 18 });
  const sy = useSpring(y, { stiffness: 180, damping: 18 });

  const rotX = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const rotY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const glowX = useTransform(sx, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(sy, [-0.5, 0.5], ["20%", "80%"]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="group relative h-full"
    >
      <div className="kib-frame relative aspect-[4/5] w-full bg-gradient-to-br from-[#3B1F1A] via-[#2A1411] to-[#1A0F0D] p-8 text-amber-50">
        {/* Glow that follows cursor */}
        <motion.div
          aria-hidden
          style={{
            background: useMotionTemplate`radial-gradient(420px circle at ${glowX} ${glowY}, rgba(212,175,55,0.35), transparent 60%)`,
          }}
          className="pointer-events-none absolute inset-0"
        />

        {/* Floating gold corner accents */}
        <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-[#D4AF37]/70" />
        <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r border-t border-[#D4AF37]/70" />
        <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b border-l border-[#D4AF37]/70" />
        <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-[#D4AF37]/70" />

        <div
          style={{ transform: "translateZ(40px)" }}
          className="relative flex h-full flex-col"
        >
          <p className="kib-gold-text font-display text-xs uppercase tracking-[0.4em]">
            Banquet · 0{index + 1}
          </p>
          <h3 className="mt-4 font-display text-4xl font-light leading-tight">
            {name}
          </h3>
          <div className="kib-rule my-5" />
          <p className="text-sm leading-relaxed text-amber-50/75">{blurb}</p>

          <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
            <Cell label="Seated" value={`${seated}`} />
            <Cell label="Floating" value={`${floating}`} />
            <Cell label="ft²" value={`${area.toLocaleString("en-IN")}`} />
          </dl>

          <div className="mt-auto flex items-end justify-between pt-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-50/55">
                From
              </p>
              <p className="kib-shimmer font-display text-2xl">
                ₹{priceFromInr.toLocaleString("en-IN")}
              </p>
            </div>
            <Link
              href={`/book?banquet=${encodeURIComponent(id)}` as Route}
              className="rounded-full border border-[#D4AF37]/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-50/90 transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Enquire →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/5 px-2 py-2 ring-1 ring-[#D4AF37]/20">
      <dt className="text-[9px] uppercase tracking-[0.2em] text-amber-50/55">
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg">{value}</dd>
    </div>
  );
}
