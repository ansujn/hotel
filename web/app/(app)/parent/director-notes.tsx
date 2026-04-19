"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface DirectorNote {
  id: string;
  body: string;
  authorName?: string;
  context?: string; // e.g. asset title
  createdAt: string;
}

interface Props {
  notes: DirectorNote[];
}

function relativeDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

// Tiny deterministic tilt so SSR/CSR agree and each note feels
// hand-placed without motion.
function tiltFor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return ((h % 5) - 2) * 0.4;
}

export function DirectorNotes({ notes }: Props) {
  const prefersReducedMotion = useReducedMotion();

  if (notes.length === 0) return null;

  return (
    <section aria-labelledby="notes-heading" className="space-y-5">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-[10px] tracking-[0.3em] text-[#E8C872]">
          DIRECTOR{"\u2019"}S NOTES
        </div>
        <h3 id="notes-heading" className="serif mt-2 text-2xl font-bold">
          A few words from the wings
        </h3>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5">
        {notes.slice(0, 3).map((n, i) => {
          const tilt = tiltFor(n.id);
          return (
            <motion.blockquote
              key={n.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: tilt }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={prefersReducedMotion ? { transform: `rotate(${tilt}deg)` } : undefined}
              className="relative rounded-lg border border-[#2A2A36] bg-[#1A1A22] p-6 shadow-[0_10px_25px_-15px_rgba(0,0,0,0.7)]"
            >
              {/* Paper texture */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-lg opacity-[0.06] mix-blend-screen"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 20%, #fff 0.7px, transparent 0.7px), radial-gradient(circle at 70% 60%, #fff 0.6px, transparent 0.6px)",
                  backgroundSize: "18px 18px, 26px 26px",
                }}
              />
              {/* Tape */}
              <div
                aria-hidden
                className="absolute -top-2 left-6 h-4 w-16 rounded-sm bg-[#E8C872]/20 border border-[#E8C872]/30 shadow-sm"
              />

              <div className="relative">
                <div
                  aria-hidden
                  className="serif text-5xl leading-none text-[#E8C872]/40 -mb-4"
                >
                  &ldquo;
                </div>
                <p className="serif italic text-[15px] leading-relaxed text-[#E8E8EE]">
                  {n.body}
                </p>
                <footer className="mt-4 text-[11px] tracking-wider text-[#8A8A96] uppercase">
                  {n.authorName ?? "Instructor"}
                  {n.context ? <> · {n.context}</> : null}
                  <span className="mx-1.5 text-[#E8C872]">&middot;</span>
                  {relativeDate(n.createdAt)}
                </footer>
              </div>
            </motion.blockquote>
          );
        })}
      </div>
    </section>
  );
}
