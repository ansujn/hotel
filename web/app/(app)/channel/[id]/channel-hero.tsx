"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";

interface Props {
  name: string;
  initials: string;
  track: string;
  batch?: string;
  since?: string;
  canUpload: boolean;
  uploadHref: string;
  pieceCount: number;
  runtimeMinutes: number;
  avatarUrl?: string;
}

export function ChannelHero({
  name,
  initials,
  track,
  batch,
  since,
  canUpload,
  uploadHref,
  pieceCount,
  runtimeMinutes,
  avatarUrl,
}: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [cursor, setCursor] = useState({ x: 50, y: 30 });

  const { scrollY } = useScroll();
  const nameScale = useTransform(scrollY, [0, 200], [1, 0.72]);
  const nameY = useTransform(scrollY, [0, 200], [0, -12]);
  const headerOpacity = useTransform(scrollY, [80, 180], [0, 1]);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCursor({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [reduced]);

  const eyebrow = [track, batch].filter(Boolean).join(" · ").toUpperCase();

  const spotlightStyle = reduced
    ? {
        background:
          "radial-gradient(900px 500px at 22% 18%, rgba(139,92,246,0.55), transparent 60%), radial-gradient(700px 400px at 85% 80%, rgba(232,200,114,0.4), transparent 60%)",
      }
    : {
        background: `radial-gradient(700px 420px at ${cursor.x}% ${cursor.y}%, rgba(232,200,114,0.32), transparent 55%), radial-gradient(900px 520px at 22% 18%, rgba(139,92,246,0.55), transparent 60%), radial-gradient(700px 400px at 85% 80%, rgba(232,200,114,0.28), transparent 60%)`,
        transition: "background 120ms linear",
      };

  return (
    <>
      {/* Sticky shrunken header — appears on scroll */}
      <motion.div
        style={{ opacity: headerOpacity }}
        className="sticky top-0 z-20 pointer-events-none"
        aria-hidden
      >
        <div className="backdrop-blur-md bg-[#0B0B0F]/75 border-b border-[#2A2A36]">
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#E8C872] grid place-items-center text-black text-[10px] font-black">
              {initials}
            </div>
            <div className="serif text-base md:text-lg font-bold truncate">{name}</div>
            <div className="ml-auto hidden md:block text-[10px] tracking-[0.3em] text-[#8A8A96] uppercase">
              {pieceCount} pieces · {runtimeMinutes}m
            </div>
          </div>
        </div>
      </motion.div>

      <section
        ref={ref}
        className="relative overflow-hidden rounded-none md:rounded-3xl border-b md:border border-[#2A2A36] mx-0 md:mx-8"
        style={spotlightStyle}
      >
        {/* SVG curtain fringe */}
        <svg
          aria-hidden
          className="absolute top-0 left-0 w-full h-6 opacity-60"
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curtain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8C872" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#E8C872" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L1200,0 L1200,6 Q1180,20 1160,6 Q1140,20 1120,6 Q1100,20 1080,6 Q1060,20 1040,6 Q1020,20 1000,6 Q980,20 960,6 Q940,20 920,6 Q900,20 880,6 Q860,20 840,6 Q820,20 800,6 Q780,20 760,6 Q740,20 720,6 Q700,20 680,6 Q660,20 640,6 Q620,20 600,6 Q580,20 560,6 Q540,20 520,6 Q500,20 480,6 Q460,20 440,6 Q420,20 400,6 Q380,20 360,6 Q340,20 320,6 Q300,20 280,6 Q260,20 240,6 Q220,20 200,6 Q180,20 160,6 Q140,20 120,6 Q100,20 80,6 Q60,20 40,6 Q20,20 0,6 Z"
            fill="url(#curtain)"
          />
        </svg>

        {/* Starry texture */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.95) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative z-10 px-6 md:px-12 pt-14 md:pt-20 pb-10 md:pb-16">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 md:items-end">
            {/* Avatar with gradient ring */}
            <div className="shrink-0">
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-[28px] bg-gradient-to-br from-[#E8C872] via-[#8B5CF6] to-[#E8C872] opacity-70 blur-md" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl border-2 border-[#E8C872] bg-gradient-to-br from-[#8B5CF6] to-[#E8C872] grid place-items-center text-black serif text-4xl md:text-6xl font-black shadow-[0_30px_80px_-30px_rgba(232,200,114,0.7)] overflow-hidden">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[10px] md:text-[11px] tracking-[0.4em] text-[#E8C872] uppercase mb-3 font-medium">
                {eyebrow || "STUDENT CHANNEL"}
              </div>
              <motion.h1
                style={reduced ? undefined : { scale: nameScale, y: nameY, transformOrigin: "left bottom" }}
                className="serif text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight"
              >
                {name}
              </motion.h1>

              {/* Gold marquee bar */}
              <div className="mt-5 flex items-center gap-3">
                <div className="h-[3px] w-24 md:w-40 bg-gradient-to-r from-[#E8C872] via-[#f0d589] to-transparent rounded-full" />
                <div className="h-1.5 w-1.5 rounded-full bg-[#E8C872]" />
                <div className="h-[1px] flex-1 bg-[#E8C872]/20" />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 md:gap-3">
                {since && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] tracking-[0.2em] uppercase bg-[#15151C]/70 border border-[#2A2A36] text-[#C9C9D1]">
                    <span aria-hidden className="text-[#E8C872]">★</span>
                    Since {since}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] tracking-[0.2em] uppercase bg-[#15151C]/70 border border-[#2A2A36] text-[#C9C9D1]">
                  {pieceCount} {pieceCount === 1 ? "Piece" : "Pieces"}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] tracking-[0.2em] uppercase bg-[#15151C]/70 border border-[#2A2A36] text-[#C9C9D1]">
                  {runtimeMinutes}m Runtime
                </span>
              </div>

              {canUpload && (
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={uploadHref as Route}>
                    <Button variant="primary" size="lg">
                      + Upload new piece
                    </Button>
                  </Link>
                  <a
                    href="#body-of-work"
                    className="inline-flex items-center gap-2 px-5 h-12 rounded-lg border border-[#2A2A36] text-sm text-[#C9C9D1] hover:text-white hover:border-[#E8C872]/50 transition-colors"
                  >
                    Jump to work
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
