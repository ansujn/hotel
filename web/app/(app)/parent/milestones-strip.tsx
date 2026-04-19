"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";

export interface Milestone {
  id: string;
  title: string;
  subtitle?: string;
  date: string; // ISO
  channelHref: string; // e.g. /channel/<studentId>#asset-<id>
  accent?: "gold" | "purple";
}

interface Props {
  items: Milestone[];
  viewAllHref?: string;
}

function prettyDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function MilestonesStrip({ items, viewAllHref }: Props) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="milestones-heading">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between mb-5"
      >
        <div>
          <div className="text-[10px] tracking-[0.3em] text-[#E8C872]">
            PROUDEST MOMENTS
          </div>
          <h3 id="milestones-heading" className="serif mt-2 text-2xl font-bold">
            From the program book
          </h3>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref as Route}
            className="text-xs tracking-[0.25em] text-[#8A8A96] hover:text-white transition-colors"
          >
            VIEW ALL
          </Link>
        )}
      </motion.div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2A2A36] bg-[#15151C]/50 p-10 text-center">
          <p className="serif text-lg text-[#C9C9D1]">
            The first chapter is being written.
          </p>
          <p className="mt-2 text-sm text-[#8A8A96] max-w-md mx-auto">
            Once your child{"\u2019"}s recordings are published, they{"\u2019"}ll appear here like
            pages in a family yearbook.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {items.slice(0, 3).map((m, i) => (
            <motion.div
              key={m.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href={m.channelHref as Route}
                className="group block h-full rounded-2xl border border-[#2A2A36] bg-[#15151C] p-5 hover:border-[#E8C872]/40 hover:-translate-y-0.5 transition-all"
              >
                {/* Playbill-style header */}
                <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 via-[#1A1030] to-[#0B0B0F] border border-[#E8C872]/20 relative overflow-hidden flex flex-col justify-between p-4">
                  <div
                    aria-hidden
                    className="absolute inset-2 rounded-md border border-[#E8C872]/10 pointer-events-none"
                  />
                  <div className="relative">
                    <div className="text-[9px] tracking-[0.4em] text-[#E8C872]/80">
                      PROGRAM
                    </div>
                    <div className="mt-1 h-px w-8 bg-[#E8C872]/40" />
                  </div>
                  <div className="relative">
                    <div className="serif text-2xl leading-tight font-bold text-[#F5F5F7] group-hover:text-[#E8C872] transition-colors">
                      {m.title}
                    </div>
                    {m.subtitle && (
                      <div className="mt-1 text-[11px] italic text-[#C9C9D1]">
                        {m.subtitle}
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between text-[10px] tracking-widest text-[#8A8A96] uppercase">
                      <span>{prettyDate(m.date)}</span>
                      <span className="text-[#E8C872] group-hover:translate-x-0.5 transition-transform">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
