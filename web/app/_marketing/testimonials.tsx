"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  signatureSeed: number; // 0..6 picks a signature flourish
}

interface Props {
  items: Testimonial[];
}

/**
 * Act IV — Playbill-style testimonials.
 * Cards sit at slight alternating rotations, with a torn-paper tape tab
 * and a hand-drawn SVG signature flourish. Rotations are removed when the
 * user prefers reduced motion.
 * TODO: wire to a CMS (Sanity or Notion) when we have real quotes.
 */
export function Testimonials({ items }: Props) {
  const reduce = useReducedMotion();
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((t, i) => {
        const rot = reduce ? 0 : ((i % 2 === 0 ? -1 : 1) * (1 + (i % 3))) * 0.9;
        return (
          <motion.figure
            key={t.name}
            initial={reduce ? false : { opacity: 0, y: 30, rotate: rot }}
            whileInView={{ opacity: 1, y: 0, rotate: rot }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-[#2A2A36] bg-[#15151C] p-6 md:p-7"
            style={{
              boxShadow: "0 30px 80px -40px rgba(0,0,0,0.6)",
            }}
          >
            {/* Tape tab */}
            <span
              aria-hidden
              className="absolute -top-3 left-6 block h-5 w-14 rounded-sm"
              style={{
                background:
                  "linear-gradient(180deg, rgba(232,200,114,0.75), rgba(232,200,114,0.45))",
                transform: `rotate(${reduce ? 0 : -4 + (i % 3)}deg)`,
                boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
              }}
            />

            {/* Opening quote mark */}
            <div className="serif text-5xl leading-none text-[#E8C872]/60 select-none">
              &ldquo;
            </div>
            <blockquote className="serif -mt-2 text-lg leading-snug text-[#F5F5F7]">
              {t.quote}
            </blockquote>

            <div className="mt-5 flex items-end justify-between gap-4">
              <figcaption className="text-[12px] text-[#8A8A96]">
                <div className="serif text-base font-bold text-white">
                  {t.name}
                </div>
                <div className="tracking-wider">{t.role}</div>
              </figcaption>
              <Signature seed={t.signatureSeed} />
            </div>
          </motion.figure>
        );
      })}
    </div>
  );
}

function Signature({ seed }: { seed: number }) {
  const flourishes = [
    "M2 18 C15 2, 40 30, 60 12 S110 20, 140 8",
    "M4 22 Q30 2, 60 22 T120 10 Q140 4, 150 20",
    "M3 16 C20 30, 50 -2, 80 16 S120 24, 148 8",
    "M2 12 Q30 28, 60 10 Q90 -4, 120 14 T150 18",
    "M4 20 C28 6, 56 28, 88 14 S140 4, 152 20",
    "M3 14 Q28 24, 56 10 Q92 -2, 120 16 T150 12",
    "M2 16 C18 2, 44 28, 80 12 S136 22, 150 6",
  ];
  const path = flourishes[seed % flourishes.length];
  return (
    <svg width="110" height="28" viewBox="0 0 152 28" fill="none" aria-hidden>
      <path
        d={path}
        stroke="#E8C872"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
      <circle cx="148" cy="10" r="1.6" fill="#E8C872" />
    </svg>
  );
}
