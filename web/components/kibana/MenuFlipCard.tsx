"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Award, Flame, Leaf } from "lucide-react";

interface Props {
  name: string;
  description: string;
  price: number;
  veg: boolean;
  signature?: boolean;
  spice?: 1 | 2 | 3;
  category: string;
  index: number;
}

/** Flippable menu card — front shows essentials, back reveals chef's note. */
export function MenuFlipCard(props: Props) {
  const [flipped, setFlipped] = useState(false);
  const { name, description, price, veg, signature, spice, category, index } = props;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={() => setFlipped((v) => !v)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      style={{ perspective: 1200 }}
      className="group relative block aspect-[4/5] w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
      aria-label={`${name}, ₹${price}. Click to ${flipped ? "hide" : "see"} chef's note.`}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {/* FRONT */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="kib-frame absolute inset-0 flex flex-col bg-gradient-to-br from-[#FBF8F1] via-[#F3EBD7] to-[#E9DDB6] p-7 text-[#3B1F1A]"
        >
          <p className="kib-gold-text font-display text-[11px] uppercase tracking-[0.4em]">
            {category}
          </p>
          <h3 className="mt-4 font-display text-2xl leading-tight">{name}</h3>
          <div className="kib-rule my-4" />
          <p className="text-sm leading-relaxed text-[#3B1F1A]/75">{description}</p>

          <div className="mt-auto flex items-end justify-between pt-6">
            <div className="flex items-center gap-2 text-[#3B1F1A]/70">
              {signature ? (
                <span
                  title="Signature dish"
                  className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7a5a0a]"
                >
                  <Award size={10} aria-hidden /> Signature
                </span>
              ) : null}
              {veg ? (
                <span
                  title="Vegetarian"
                  className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-emerald-700 text-emerald-700"
                  aria-label="Vegetarian"
                >
                  <Leaf size={10} aria-hidden />
                </span>
              ) : null}
              {spice ? (
                <span className="inline-flex items-center text-rose-700" aria-label={`Spice level ${spice}`}>
                  {Array.from({ length: spice }).map((_, i) => (
                    <Flame key={i} size={10} aria-hidden />
                  ))}
                </span>
              ) : null}
            </div>
            <p className="kib-shimmer font-display text-3xl">₹{price}</p>
          </div>
        </div>

        {/* BACK */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="kib-frame absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#3B1F1A] via-[#2A1411] to-[#1A0F0D] p-7 text-amber-50"
        >
          <p className="kib-gold-text font-display text-[11px] uppercase tracking-[0.4em]">
            Chef's Note
          </p>
          <p className="mt-5 max-w-[26ch] text-center font-display text-xl italic leading-snug text-amber-50/90">
            "{description}"
          </p>
          <div className="kib-rule my-5 w-32" />
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-amber-50/55">
            — Chef Arjun, Head of Kitchen
          </p>
        </div>
      </motion.div>
    </motion.button>
  );
}
