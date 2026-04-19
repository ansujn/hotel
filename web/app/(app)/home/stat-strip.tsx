"use client";

import { useEffect, useRef, useState } from "react";

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  /** decimals for the count-up display */
  decimals?: number;
  accent?: "gold" | "violet";
}

interface StatStripProps {
  stats: Stat[];
}

/**
 * A row of theatre-poster stat tiles that count up on scroll-into-view
 * and tilt on hover (desktop only). Reduced motion = static numbers.
 */
export function StatStrip({ stats }: StatStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
      {stats.map((s, i) => (
        <StatTile key={s.label} stat={s} index={i} />
      ))}
    </div>
  );
}

function StatTile({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setInteractive(!reduce && !coarse);

    if (reduce) {
      setDisplay(stat.value);
      return;
    }

    const el = ref.current;
    if (!el) {
      setDisplay(stat.value);
      return;
    }

    let started = false;
    let raf: number | null = null;

    const runCountUp = () => {
      if (started) return;
      started = true;
      const duration = 1100 + index * 80;
      const start = performance.now();
      const from = 0;
      const to = stat.value;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(from + (to - from) * eased);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCountUp();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stat.value, index]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 8).toFixed(2)}deg`);
  };

  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  const shown =
    stat.decimals != null
      ? display.toFixed(stat.decimals)
      : Math.round(display).toLocaleString("en-IN");

  const accent = stat.accent === "violet" ? "#8B5CF6" : "#E8C872";

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative rounded-2xl border border-[#2A2A36] bg-[#15151C] p-5 md:p-6 overflow-hidden"
      style={{
        transformStyle: "preserve-3d",
        transform:
          "perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
        transition: "transform 200ms ease-out",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full opacity-30 blur-3xl"
        style={{ background: accent }}
      />
      <div className="text-[10px] tracking-[0.3em] text-[#8A8A96] mb-2">
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
