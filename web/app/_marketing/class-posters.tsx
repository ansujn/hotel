"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export interface ClassItem {
  title: string;
  age: string;
  desc: string;
  fee: string;
  accent: string; // hex
  accent2: string;
  motif: "monologue" | "scene" | "showcase" | "little";
}

interface Props {
  classes: ClassItem[];
}

/**
 * Act II — the four class "posters."
 * Each card is a faux theatre poster that tilts on hover in 3D, with a subtle
 * paper-grain, a gold frame that appears on hover, and a small SVG motif
 * matching the class. No motion on mobile / reduced-motion — just a clean grid.
 */
export function ClassPosters({ classes }: Props) {
  const reduce = useReducedMotion();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
      {classes.map((c, i) => (
        <motion.div
          key={c.title}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <Poster item={c} />
        </motion.div>
      ))}
    </div>
  );
}

function Poster({ item }: { item: ClassItem }) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 10).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(1)}px`);
    el.style.setProperty("--my", `${(e.clientY - r.top).toFixed(1)}px`);
  };
  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <Link
      ref={ref}
      href={"/login" as Route}
      aria-label={`${item.title} — ${item.age}. Book a trial.`}
      className="group relative block rounded-2xl border border-[#2A2A36] bg-[#120712] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/70"
      style={{
        transformStyle: "preserve-3d",
        transform:
          "perspective(1100px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        transition: "transform 260ms ease-out, border-color 200ms ease-out",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="relative p-5"
        style={{ minHeight: 340 }}
      >
        {/* Poster illustration area */}
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-xl"
          style={{
            background: `radial-gradient(140% 90% at 30% 10%, ${item.accent}2a 0%, transparent 55%), linear-gradient(160deg, ${item.accent} 0%, ${item.accent2} 100%)`,
          }}
        >
          {/* Paper grain */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />
          {/* Diagonal shine (follows cursor) */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.28), transparent 45%)",
              mixBlendMode: "screen",
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <ClassMotif motif={item.motif} />
          </div>
          {/* Bottom act number */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3">
            <span className="text-[10px] tracking-[0.4em] text-black/70">
              VIK · STUDIO
            </span>
            <span className="serif text-2xl font-black text-black/70">
              {item.title.charAt(0)}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5">
          <div className="text-[10px] tracking-[0.35em] text-[#8A8A96] uppercase">
            {item.age}
          </div>
          <h3 className="serif mt-1 text-xl font-black text-white">
            {item.title}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[#B0B0BA]">
            {item.desc}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span
              className="serif text-xl font-black"
              style={{ color: "#E8C872" }}
            >
              {item.fee}
            </span>
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2A2A36] text-[#C9C9D1] transition-all group-hover:border-[#E8C872]/60 group-hover:text-[#E8C872]"
            >
              →
            </span>
          </div>
        </div>
      </div>

      {/* Gold frame on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-2 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(232,200,114,0.65), 0 0 40px rgba(232,200,114,0.25)",
        }}
      />
    </Link>
  );
}

function ClassMotif({ motif }: { motif: ClassItem["motif"] }) {
  const stroke = "#0B0B0F";
  if (motif === "monologue") {
    // Single mic + spotlight halo
    return (
      <svg width="120" height="160" viewBox="0 0 120 160" fill="none">
        <ellipse cx="60" cy="30" rx="42" ry="14" fill={stroke} opacity="0.18" />
        <rect x="52" y="22" width="16" height="48" rx="8" fill={stroke} />
        <rect x="58" y="70" width="4" height="42" fill={stroke} />
        <rect x="40" y="112" width="40" height="4" rx="2" fill={stroke} />
        <path
          d="M38 140 L60 116 L82 140 Z"
          fill={stroke}
          opacity="0.22"
        />
      </svg>
    );
  }
  if (motif === "scene") {
    // Two figures facing each other
    return (
      <svg width="160" height="150" viewBox="0 0 160 150" fill="none">
        <circle cx="48" cy="40" r="14" fill={stroke} />
        <path d="M30 110 Q48 70 66 110 Z" fill={stroke} />
        <circle cx="112" cy="40" r="14" fill={stroke} />
        <path d="M94 110 Q112 70 130 110 Z" fill={stroke} />
        <path d="M68 70 Q80 58 92 70" stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  if (motif === "showcase") {
    // Curtain arch + star
    return (
      <svg width="160" height="140" viewBox="0 0 160 140" fill="none">
        <path
          d="M20 20 Q80 -10 140 20 L140 120 L20 120 Z"
          fill={stroke}
          opacity="0.18"
        />
        <path
          d="M20 20 Q50 8 80 18 L80 120 L20 120 Z"
          fill={stroke}
          opacity="0.35"
        />
        <path
          d="M140 20 Q110 8 80 18 L80 120 L140 120 Z"
          fill={stroke}
          opacity="0.35"
        />
        <polygon
          points="80,46 87,66 108,66 91,78 98,98 80,86 62,98 69,78 52,66 73,66"
          fill={stroke}
        />
      </svg>
    );
  }
  // little stage — story book with stars
  return (
    <svg width="160" height="140" viewBox="0 0 160 140" fill="none">
      <path d="M24 32 L80 20 L80 118 L24 110 Z" fill={stroke} opacity="0.8" />
      <path d="M136 32 L80 20 L80 118 L136 110 Z" fill={stroke} opacity="0.5" />
      <path
        d="M34 50 L72 44 M34 66 L72 60 M34 82 L72 76"
        stroke={stroke}
        strokeOpacity="0.2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polygon
        points="112,44 115,52 123,52 117,58 120,66 112,61 104,66 107,58 101,52 109,52"
        fill={stroke}
      />
    </svg>
  );
}
