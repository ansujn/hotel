"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion, useReducedMotion } from "framer-motion";
import { Starfield } from "./starfield";
import { FloatingMasks } from "./floating-masks";

/**
 * Act I — The Invitation.
 *
 * Grand marquee hero with:
 *   - starry parallax backdrop
 *   - velvet curtains on the viewport edges
 *   - bulb-lit brand plaque with CSS flicker keyframes
 *   - serif display headline with gold spotlight text-shadow
 *   - floating comedy/tragedy masks (desktop only)
 *   - twin CTAs to /login
 *
 * Everything degrades gracefully with prefers-reduced-motion.
 */
export function HeroAct() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="vik-hero-title"
      className="relative overflow-hidden pt-10 pb-28 md:pt-16 md:pb-40"
    >
      {/* Starfield backdrop */}
      <Starfield />

      {/* Stage haze wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 12%, rgba(232,200,114,0.12) 0%, transparent 65%), radial-gradient(50% 45% at 50% 85%, rgba(139,92,246,0.14) 0%, transparent 65%)",
        }}
      />

      {/* Left velvet curtain edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-[4vw] min-w-[28px] z-[2]"
        style={{
          background:
            "repeating-linear-gradient(90deg, #4a0a1c 0 14px, #6c1028 14px 18px, #3a0716 18px 30px)",
          boxShadow:
            "inset -30px 0 80px rgba(0,0,0,0.85), inset 6px 0 30px rgba(232,200,114,0.08)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-[4vw] min-w-[28px] z-[2]"
        style={{
          background:
            "repeating-linear-gradient(-90deg, #4a0a1c 0 14px, #6c1028 14px 18px, #3a0716 18px 30px)",
          boxShadow:
            "inset 30px 0 80px rgba(0,0,0,0.85), inset -6px 0 30px rgba(232,200,114,0.08)",
        }}
      />

      {/* Proscenium valance at top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-10 md:h-14 z-[2]"
        style={{
          background:
            "linear-gradient(180deg, #1e0810 0%, #2a0a18 50%, transparent 100%)",
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-2"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(232,200,114,0.95) 0 8px, transparent 8px 18px)",
            filter: "drop-shadow(0 0 6px rgba(232,200,114,0.5))",
          }}
        />
      </div>

      <FloatingMasks />

      <div className="relative z-[3] mx-auto max-w-6xl px-6 md:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          {/* Bulb-lit plaque */}
          <BulbPlaque />

          {/* Act label */}
          <div className="mt-8 text-[11px] tracking-[0.55em] text-[#E8C872]/80">
            ACT I  ·  THE INVITATION
          </div>

          <motion.h1
            id="vik-hero-title"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="serif mt-5 font-black leading-[0.95] tracking-tight"
            style={{
              fontSize: "clamp(2.6rem, 8.2vw, 6.25rem)",
              textShadow: "0 0 60px rgba(232,200,114,0.12)",
            }}
          >
            Where every voice
            <br />
            finds its{" "}
            <em
              className="not-italic"
              style={{
                color: "#E8C872",
                textShadow: "0 0 48px rgba(232,200,114,0.55)",
              }}
            >
              stage
            </em>
            <span className="text-[#E8C872]">.</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mx-auto mt-8 max-w-xl text-[15px] md:text-lg text-[#C9C9D1] leading-relaxed"
          >
            Personal coaching for young performers in India — monologue work,
            scene study, full-production showcases. Small batches. Real progress.
            From stage fright to standing ovation.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4"
          >
            <Link
              href={"/login" as Route}
              aria-label="Book a trial class"
              className="group relative inline-flex h-14 items-center justify-center rounded-xl px-8 text-[15px] font-semibold text-black transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/70 active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(180deg, #f2d58a 0%, #E8C872 55%, #c9a656 100%)",
                boxShadow:
                  "0 18px 44px -10px rgba(232,200,114,0.55), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.15)",
              }}
            >
              <span className="relative z-[1] flex items-center gap-2">
                Book a Trial Class
                <span aria-hidden>→</span>
              </span>
              <span
                aria-hidden
                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow:
                    "0 0 0 2px rgba(232,200,114,0.5), 0 24px 60px -12px rgba(232,200,114,0.75)",
                }}
              />
            </Link>
            <Link
              href={"/login" as Route}
              className="inline-flex h-14 items-center justify-center rounded-xl border border-[#2A2A36] bg-[#15151C]/70 px-6 text-sm font-semibold text-[#F5F5F7] backdrop-blur transition-colors hover:border-[#E8C872]/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60"
            >
              Student Login
            </Link>
          </motion.div>

          {/* Social proof strip (subtle) */}
          <div className="mt-12 flex items-center justify-center gap-6 text-[11px] tracking-[0.35em] text-[#8A8A96]">
            <span>BANGALORE</span>
            <span aria-hidden className="h-px w-8 bg-[#2A2A36]" />
            <span>EST. 2019</span>
            <span aria-hidden className="hidden md:inline-block h-px w-8 bg-[#2A2A36]" />
            <span className="hidden md:inline">AGES 6–18</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BulbPlaque() {
  const letters = "VIK THEATRE".split("");
  return (
    <div className="mx-auto inline-flex flex-col items-center">
      {/* Top bulb row */}
      <BulbRow />
      <div
        className="relative mx-auto mt-2 rounded-md px-5 py-2 md:px-7 md:py-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(32,12,20,0.6) 0%, rgba(18,8,12,0.7) 100%)",
          border: "1px solid rgba(232,200,114,0.22)",
          boxShadow:
            "inset 0 0 24px rgba(232,200,114,0.08), 0 0 60px rgba(232,200,114,0.08)",
        }}
      >
        <div className="flex items-center gap-[0.18em] md:gap-[0.22em]">
          {letters.map((ch, i) => (
            <span
              key={i}
              aria-hidden={ch === " " ? true : undefined}
              className={`serif text-[11px] md:text-sm font-black tracking-[0.35em] ${
                ch === " " ? "w-3 md:w-4" : "vik-bulb-letter"
              }`}
              style={{
                color: "#E8C872",
                textShadow:
                  "0 0 6px rgba(232,200,114,0.8), 0 0 14px rgba(232,200,114,0.45)",
                animationDelay: `${(i * 0.17).toFixed(2)}s`,
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </div>
      </div>
      <BulbRow />

      <style>{`
        @keyframes vik-flicker {
          0%, 19%, 22%, 62%, 64%, 100% { opacity: 1; }
          20%, 21% { opacity: 0.45; }
          63% { opacity: 0.55; }
        }
        .vik-bulb-letter { animation: vik-flicker 6s infinite steps(1, end); }
        @media (prefers-reduced-motion: reduce) {
          .vik-bulb-letter { animation: none !important; }
          .vik-bulb-row span { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function BulbRow() {
  const bulbs = Array.from({ length: 11 });
  return (
    <div className="vik-bulb-row flex items-center gap-[10px] md:gap-[14px] py-[6px]">
      {bulbs.map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block h-[6px] w-[6px] md:h-[8px] md:w-[8px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #fff6d6 0%, #E8C872 40%, #a37d2f 100%)",
            boxShadow:
              "0 0 6px rgba(232,200,114,0.9), 0 0 14px rgba(232,200,114,0.55)",
            animation: `vik-flicker 5.5s ${(i * 0.23).toFixed(2)}s infinite steps(1, end)`,
          }}
        />
      ))}
    </div>
  );
}
