"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Act III — "Inside a Class."
 * A two-column sticky scroll piece. Left column is a mock playback surface
 * (faux teleprompter / video frame) with a subtle scan-line effect. Right
 * column: three rubric dimensions whose bars rise as the section scrolls past.
 */
export function RubricAct() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Map progress to bar widths (0→100%)
  const diction = useTransform(scrollYProgress, [0.15, 0.55], [0.15, 0.88]);
  const presence = useTransform(scrollYProgress, [0.2, 0.6], [0.2, 0.72]);
  const emotion = useTransform(scrollYProgress, [0.25, 0.65], [0.18, 0.94]);

  return (
    <div
      ref={sectionRef}
      className="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14"
    >
      {/* Left: stage playback surface */}
      <div className="md:sticky md:top-24 self-start">
        <MockStage />
      </div>

      {/* Right: director's note + rubric */}
      <div className="space-y-8">
        <div>
          <div className="text-[11px] tracking-[0.45em] text-[#E8C872]/80 mb-3">
            ACT III  ·  INSIDE A CLASS
          </div>
          <h2 className="serif text-4xl md:text-5xl font-black leading-[1.03]">
            We film it.{" "}
            <em className="not-italic text-[#E8C872]">Watch it.</em>{" "}
            Work on the part that matters.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#C9C9D1]">
            Every scene recorded. Every student gets a private channel. Each
            piece scored on the three things that actually change performances —
            diction, presence, emotional range — so the feedback isn&apos;t
            vibes, it&apos;s a ladder.
          </p>
        </div>

        <div className="space-y-5">
          <RubricBar
            label="Diction"
            value={reduce ? 0.88 : (diction as unknown as number)}
            staticValue={0.88}
            reduce={!!reduce}
            color="#E8C872"
          />
          <RubricBar
            label="Presence"
            value={reduce ? 0.72 : (presence as unknown as number)}
            staticValue={0.72}
            reduce={!!reduce}
            color="#8B5CF6"
          />
          <RubricBar
            label="Emotional range"
            value={reduce ? 0.94 : (emotion as unknown as number)}
            staticValue={0.94}
            reduce={!!reduce}
            color="#E8C872"
          />
        </div>

        {/* Director's note */}
        <figure
          className="rounded-2xl border border-[#2A2A36] bg-[#15151C] p-6 md:p-7"
          style={{ boxShadow: "0 30px 80px -40px rgba(232,200,114,0.18)" }}
        >
          <div className="text-[10px] tracking-[0.45em] text-[#E8C872] mb-3">
            DIRECTOR&apos;S NOTE
          </div>
          <blockquote className="serif text-xl md:text-2xl leading-snug text-[#F5F5F7]">
            &ldquo;The first week, they apologise for their voice. By week six,
            they command a room. That&apos;s the work.&rdquo;
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3 text-xs text-[#8A8A96]">
            <span
              className="inline-block h-7 w-7 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, #E8C872 0%, #8B5CF6 100%)",
              }}
              aria-hidden
            />
            <span>Vik Prasad — Founder &amp; Director, Vik Theatre</span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

function RubricBar({
  label,
  value,
  staticValue,
  reduce,
  color,
}: {
  label: string;
  value: number | { get: () => number };
  staticValue: number;
  reduce: boolean;
  color: string;
}) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const scoreRef = useRef<HTMLSpanElement | null>(null);
  const [staticPct] = useState(Math.round(staticValue * 100));

  useEffect(() => {
    if (reduce) return;
    if (!barRef.current || !scoreRef.current) return;
    const mv = value as unknown as { get: () => number; on: (k: string, cb: (v: number) => void) => () => void };
    if (typeof mv?.on !== "function") return;
    const apply = (v: number) => {
      if (barRef.current) barRef.current.style.width = `${Math.max(0, Math.min(1, v)) * 100}%`;
      if (scoreRef.current) scoreRef.current.textContent = `${Math.round(v * 100)}`;
    };
    apply(mv.get());
    const unsub = mv.on("change", apply);
    return () => unsub();
  }, [value, reduce]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="serif text-base font-bold text-white">{label}</div>
        <div className="text-sm text-[#C9C9D1]">
          <span ref={scoreRef} className="tabular-nums" style={{ color }}>
            {staticPct}
          </span>
          <span className="text-[#8A8A96]"> / 100</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-[#15151C] overflow-hidden border border-[#2A2A36]">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{
            width: reduce ? `${staticPct}%` : "0%",
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            boxShadow: `0 0 18px ${color}55`,
            transition: "width 120ms linear",
          }}
        />
      </div>
    </div>
  );
}

function MockStage() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-[22px] border border-[#2A2A36] bg-[#0B0B0F] overflow-hidden"
      style={{ aspectRatio: "4 / 5", boxShadow: "0 40px 100px -40px rgba(139,92,246,0.35)" }}
    >
      {/* Backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 30%, rgba(232,200,114,0.22) 0%, transparent 65%), linear-gradient(180deg, #1a0d22 0%, #0B0B0F 100%)",
        }}
      />
      {/* Stage floor */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[35%]"
        style={{
          background:
            "repeating-linear-gradient(90deg, #1a1015 0 36px, #130b10 36px 72px)",
          transform: "perspective(700px) rotateX(58deg)",
          transformOrigin: "bottom center",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 35%, #000 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 35%, #000 100%)",
          opacity: 0.55,
        }}
      />
      {/* Spotlight pool */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[12%] h-[80%] w-[75%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232,200,114,0.3) 0%, rgba(232,200,114,0.08) 40%, transparent 72%)",
        }}
      />

      {/* Figure silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 200 260"
        className="absolute left-1/2 top-[28%] h-[55%] -translate-x-1/2"
      >
        <ellipse cx="100" cy="250" rx="64" ry="8" fill="#000" opacity="0.55" />
        <circle cx="100" cy="46" r="24" fill="#0B0B0F" />
        <path
          d="M62 110 Q100 80 138 110 L150 210 Q100 230 50 210 Z"
          fill="#0B0B0F"
        />
        <path
          d="M66 118 L44 180 M134 118 L156 180"
          stroke="#0B0B0F"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>

      {/* Scan lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 1px, transparent 1px 3px)",
        }}
      />

      {/* HUD */}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md border border-[#2A2A36] bg-black/50 px-2.5 py-1.5 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
        <span className="text-[10px] tracking-[0.35em] text-[#C9C9D1]">REC</span>
      </div>
      <div className="absolute right-4 top-4 rounded-md border border-[#2A2A36] bg-black/50 px-2.5 py-1.5 backdrop-blur">
        <span className="text-[10px] tracking-[0.35em] text-[#E8C872]">
          TAKE 03
        </span>
      </div>

      {/* Bottom playback bar */}
      <div className="absolute inset-x-4 bottom-4 rounded-xl border border-[#2A2A36] bg-black/60 p-3 backdrop-blur">
        <div className="flex items-center justify-between text-[10px] tracking-[0.3em] text-[#8A8A96]">
          <span>MONOLOGUE · ACT II</span>
          <span>01:24 / 02:10</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-[#2A2A36] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: "62%",
              background: "linear-gradient(90deg, #E8C872, #f0d589)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
