"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  format?: "int" | "decimal";
}

interface Props {
  stats: Stat[];
}

export function ChannelStats({ stats }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-8 mt-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, suffix, format = "int" }: Stat) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduced]);

  const shown =
    format === "decimal" ? display.toFixed(1) : Math.round(display).toString();

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-[#2A2A36] bg-[#15151C] p-5 md:p-6"
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(232,200,114,0.7), transparent)",
        }}
      />
      <div className="text-[9px] md:text-[10px] tracking-[0.35em] text-[#8A8A96] uppercase">
        {label}
      </div>
      <div className="serif text-3xl md:text-4xl font-black text-[#E8C872] mt-2 tabular-nums">
        {shown}
        {suffix && <span className="text-lg md:text-xl text-[#C9C9D1] font-semibold ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
