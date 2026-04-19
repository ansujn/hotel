"use client";

import { useEffect, useRef, useState } from "react";

export interface PublicStat {
  label: string;
  value: number;
  suffix?: string;
  accent?: "gold" | "violet";
}

interface Props {
  stats: PublicStat[];
}

/**
 * Stats strip — count-up on scroll-into-view, poster-tilt on desktop hover.
 * Reduced motion: static final numbers, no tilt. Mobile: no tilt.
 *
 * TODO: wire numbers to a real /api/stats endpoint once we have one.
 */
export function StatStrip({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {stats.map((s, i) => (
        <Tile key={s.label} stat={s} index={i} />
      ))}
    </div>
  );
}

function Tile({ stat, index }: { stat: PublicStat; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [tilt, setTilt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setTilt(!reduce && !coarse);

    if (reduce) {
      setDisplay(stat.value);
      return;
    }

    const el = ref.current;
    if (!el) {
      setDisplay(stat.value);
      return;
    }

    let raf: number | null = null;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const duration = 1200 + index * 90;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(stat.value * eased);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stat.value, index]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 5).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 7).toFixed(2)}deg`);
  };
  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const accent = stat.accent === "violet" ? "#8B5CF6" : "#E8C872";
  const shown = Math.round(display).toLocaleString("en-IN");

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative overflow-hidden rounded-2xl border border-[#2A2A36] bg-[#15151C] p-5 md:p-6"
      style={{
        transformStyle: "preserve-3d",
        transform:
          "perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        transition: "transform 220ms ease-out",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: accent }}
      />
      <div className="text-[10px] tracking-[0.35em] text-[#8A8A96] mb-2">
        {stat.label}
      </div>
      <div className="serif text-4xl md:text-5xl font-black tabular-nums">
        <span style={{ color: accent }}>{shown}</span>
        {stat.suffix && (
          <span className="ml-1 text-base md:text-lg text-[#8A8A96] font-normal">
            {stat.suffix}
          </span>
        )}
      </div>
    </div>
  );
}
