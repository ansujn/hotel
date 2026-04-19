"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  d: number; // parallax depth 0..1
}

function hash(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/**
 * Parallax starry backdrop. Deterministic star positions (so SSR matches),
 * two depth layers, slow drift on scroll, subtler on mobile, off with reduced motion.
 * Pure SVG — no canvas, no framer.
 */
export function Starfield() {
  const ref = useRef<SVGSVGElement | null>(null);
  const [mode, setMode] = useState<"full" | "static" | "mobile">("full");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    if (reduce) setMode("static");
    else if (small) setMode("mobile");
    else setMode("full");

    if (reduce) return;

    const onScroll = () => {
      if (!ref.current) return;
      const y = window.scrollY;
      const k = small ? 0.04 : 0.08;
      ref.current.style.setProperty("--sy1", `${-(y * k).toFixed(1)}px`);
      ref.current.style.setProperty("--sy2", `${-(y * k * 0.4).toFixed(1)}px`);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stars = useMemo<Star[]>(() => {
    const total = 140;
    const arr: Star[] = [];
    for (let i = 0; i < total; i++) {
      arr.push({
        x: hash(i) * 100,
        y: hash(i + 101) * 100,
        r: 0.4 + hash(i + 303) * 1.4,
        o: 0.25 + hash(i + 505) * 0.7,
        d: hash(i + 707) > 0.55 ? 1 : 0,
      });
    }
    return arr;
  }, []);

  const farStars = stars.filter((s) => s.d === 0);
  const nearStars = stars.filter((s) => s.d === 1);

  return (
    <svg
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        zIndex: 0,
      }}
    >
      <defs>
        <radialGradient id="vik-star-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8C872" stopOpacity="1" />
          <stop offset="60%" stopColor="#E8C872" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#E8C872" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Far layer (slow) */}
      <g
        style={{
          transform:
            mode === "static" ? "none" : "translate3d(0, var(--sy2, 0), 0)",
          transition: "transform 180ms linear",
        }}
      >
        {farStars.map((s, i) => (
          <circle
            key={`f${i}`}
            cx={s.x}
            cy={s.y}
            r={s.r * 0.22}
            fill="#F5F5F7"
            opacity={s.o * 0.6}
          />
        ))}
      </g>
      {/* Near layer (faster) */}
      <g
        style={{
          transform:
            mode === "static" ? "none" : "translate3d(0, var(--sy1, 0), 0)",
          transition: "transform 160ms linear",
        }}
      >
        {nearStars.map((s, i) => (
          <circle
            key={`n${i}`}
            cx={s.x}
            cy={s.y}
            r={s.r * 0.3}
            fill={i % 11 === 0 ? "#E8C872" : "#F5F5F7"}
            opacity={s.o}
          />
        ))}
      </g>
    </svg>
  );
}
