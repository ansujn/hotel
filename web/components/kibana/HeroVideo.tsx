"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";

// Three.js scenes are heavy — load only on the client.
const KibanaLogo3D = dynamic(() => import("./KibanaLogo3D"), {
  ssr: false,
  loading: () => null,
});

interface HeroVideoProps {
  videoSrc: string;
  poster?: string;
}

export function HeroVideo({ videoSrc, poster }: HeroVideoProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Parallax on scroll: video creeps up, content fades + drifts down.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#1A0F0D]"
    >
      {/* Video layer with parallax */}
      <motion.div
        style={{ y: videoY }}
        className="absolute inset-0 h-[120%] w-full"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          className="h-full w-full object-cover"
          preload="metadata"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </motion.div>

      {/* Cinematic gradient overlay */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="kib-cinema-overlay pointer-events-none absolute inset-0"
        aria-hidden
      />

      {/* Subtle film grain via SVG noise — purely decorative */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
        aria-hidden
      />

      {/* Top sheen */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#1A0F0D]/70 to-transparent"
        aria-hidden
      />

      {/* Content overlay */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-end gap-8 px-6 pb-20 pt-32 text-center sm:pb-28 sm:pt-36 lg:pb-32"
      >
        {/* 3D rotating logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="kib-float h-32 w-32 sm:h-40 sm:w-40"
        >
          <KibanaLogo3D />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="kib-ornament"
        >
          <span>Saudagar's Lane · Jaipur</span>
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="font-display text-5xl font-light leading-[1.05] tracking-tight text-amber-50 sm:text-7xl lg:text-[6.5rem]"
        >
          Experience{" "}
          <span className="kib-shimmer italic">Kibana Jaipur</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="max-w-xl text-base text-amber-50/85 sm:text-lg"
        >
          A cinematic rooftop above the Pink City. Five banquet halls. One
          unforgettable evening, every evening.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 1 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href={"/book" as Route}
            className="kib-btn-gold rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.18em]"
          >
            Reserve a Table
          </Link>
          <Link
            href={"/banquets" as Route}
            className="kib-btn-ghost rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.18em]"
          >
            Tour the Halls
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-amber-50/60"
          aria-hidden
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="block h-6 w-px bg-amber-50/60"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
