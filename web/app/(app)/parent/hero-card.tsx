"use client";

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";
import type { PointerEvent as ReactPointerEvent } from "react";

export interface ChildSummary {
  id: string;
  name: string;
  batchName?: string;
  enrolledSince?: string;
  nextClassAt?: string;
  assetCount?: number;
  attendancePct?: number;
  initials?: string;
}

interface Props {
  parentFirstName: string;
  child: ChildSummary;
  siblings: ChildSummary[];
  activeChildId: string;
}

function fmtDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function fmtNextClass(iso?: string) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST"
  );
}

export function HeroCard({ parentFirstName, child, siblings, activeChildId }: Props) {
  const prefersReducedMotion = useReducedMotion();

  // Mouse-tilt (desktop only, very subtle)
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotX = useSpring(useTransform(mvY, [-0.5, 0.5], [4, -4]), {
    stiffness: 120,
    damping: 20,
  });
  const rotY = useSpring(useTransform(mvX, [-0.5, 0.5], [-4, 4]), {
    stiffness: 120,
    damping: 20,
  });

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    mvX.set((e.clientX - r.left) / r.width - 0.5);
    mvY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  const enrolledSince = fmtDate(child.enrolledSince);
  const nextClass = fmtNextClass(child.nextClassAt);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative"
    >
      {/* Curtain flourish — slides in from left on load */}
      <motion.div
        aria-hidden
        initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { x: "-110%" }}
        animate={{ x: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="pointer-events-none absolute -left-2 top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-transparent via-[#E8C872] to-transparent opacity-70"
      />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={
          prefersReducedMotion
            ? undefined
            : {
                rotateX: rotX,
                rotateY: rotY,
                transformPerspective: 1200,
                transformStyle: "preserve-3d",
              }
        }
        className="relative overflow-hidden rounded-[28px] border border-[#E8C872]/30 bg-gradient-to-br from-[#1A1527] via-[#15151C] to-[#0F0A1A] p-8 md:p-12 shadow-[0_30px_80px_-30px_rgba(232,200,114,0.25),0_10px_30px_-10px_rgba(0,0,0,0.6)]"
      >
        {/* Gold inner frame (program-book aesthetic) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-4 rounded-[20px] border border-[#E8C872]/15"
        />
        {/* Soft paper grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 80%, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px, 60px 60px",
          }}
        />
        {/* Gold accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full bg-[#E8C872]/10 blur-3xl"
        />

        <div className="relative grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="text-[11px] tracking-[0.4em] text-[#E8C872]">
              WELCOME, {parentFirstName.toUpperCase()}
            </div>

            <h2 id="hero-heading" className="serif mt-5 text-[44px] md:text-[68px] leading-[0.95] font-black">
              <span className="text-[#F5F5F7]">{child.name}</span>
              <span className="text-[#8A8A96] font-normal italic text-3xl md:text-4xl">
                {"\u2019"}s semester
              </span>
              <br />
              <em className="not-italic bg-gradient-to-r from-[#E8C872] via-[#f5d98a] to-[#E8C872] bg-clip-text text-transparent">
                so far.
              </em>
            </h2>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              {child.batchName && (
                <InfoBit label="Batch" value={child.batchName} />
              )}
              {enrolledSince && (
                <InfoBit label="Since" value={enrolledSince} />
              )}
              {nextClass && (
                <InfoBit label="Next class" value={nextClass} accent />
              )}
            </div>
          </div>

          <motion.div
            aria-hidden
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="relative hidden md:flex shrink-0"
            style={{ transform: "translateZ(30px)" }}
          >
            <div className="relative h-40 w-32 rounded-lg border-2 border-[#E8C872]/60 bg-gradient-to-br from-[#8B5CF6]/30 via-[#15151C] to-[#E8C872]/15 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] flex items-center justify-center">
              <div className="serif text-4xl font-black text-[#E8C872]">
                {child.initials ?? getInitials(child.name)}
              </div>
              <div
                aria-hidden
                className="absolute inset-1.5 rounded border border-[#E8C872]/20 pointer-events-none"
              />
            </div>
          </motion.div>
        </div>

        {siblings.length > 1 && (
          <div className="relative mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Switch child">
            {siblings.map((s) => {
              const active = s.id === activeChildId;
              return (
                <Link
                  key={s.id}
                  href={`/parent?child=${s.id}` as Route}
                  role="tab"
                  aria-selected={active}
                  className={`rounded-full border px-4 py-1.5 text-xs tracking-wider transition-colors ${
                    active
                      ? "border-[#E8C872]/60 bg-[#E8C872]/10 text-[#E8C872]"
                      : "border-[#2A2A36] text-[#8A8A96] hover:border-[#E8C872]/30 hover:text-[#C9C9D1]"
                  }`}
                >
                  {s.name}
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
}

function InfoBit({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.3em] text-[#8A8A96] uppercase">
        {label}
      </div>
      <div
        className={`mt-1 serif text-lg font-semibold ${
          accent ? "text-[#E8C872]" : "text-[#F5F5F7]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
