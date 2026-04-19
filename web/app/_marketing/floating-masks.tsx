"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Two comedy/tragedy theatre masks floating in the hero. They drift with scroll
 * (rotate + translate) and nudge toward the cursor on desktop. Hidden on mobile
 * and with prefers-reduced-motion (the hero doesn't need them to be beautiful).
 */
export function FloatingMasks() {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 768;
    if (reduce || coarse || small) return;
    setEnabled(true);

    let mx = 0;
    let my = 0;
    let raf: number | null = null;

    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = () => {
      const sy = window.scrollY;
      const rot = sy * 0.04;
      if (leftRef.current) {
        leftRef.current.style.transform = `translate3d(${mx * -18}px, ${my * -14 - sy * 0.08}px, 0) rotate(${-10 - rot}deg)`;
      }
      if (rightRef.current) {
        rightRef.current.style.transform = `translate3d(${mx * 18}px, ${my * 14 - sy * 0.05}px, 0) rotate(${14 + rot * 0.7}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={leftRef}
        aria-hidden
        className="pointer-events-none absolute -left-6 top-[28%] z-[1] will-change-transform"
        style={{ filter: "drop-shadow(0 20px 40px rgba(232,200,114,0.25))" }}
      >
        <MaskComedy />
      </div>
      <div
        ref={rightRef}
        aria-hidden
        className="pointer-events-none absolute -right-10 top-[14%] z-[1] will-change-transform"
        style={{ filter: "drop-shadow(0 20px 40px rgba(139,92,246,0.28))" }}
      >
        <MaskTragedy />
      </div>
    </>
  );
}

function MaskComedy() {
  return (
    <svg width="180" height="220" viewBox="0 0 180 220" fill="none">
      <defs>
        <linearGradient id="c-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8C872" />
          <stop offset="1" stopColor="#a37d2f" />
        </linearGradient>
      </defs>
      <path
        d="M90 10 C35 10 15 60 20 120 C25 170 60 210 90 210 C120 210 155 170 160 120 C165 60 145 10 90 10 Z"
        fill="url(#c-face)"
        opacity="0.92"
      />
      {/* eyes (curved happy) */}
      <path
        d="M50 95 Q60 78 75 95"
        stroke="#0B0B0F"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M105 95 Q120 78 130 95"
        stroke="#0B0B0F"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* big smile */}
      <path
        d="M45 140 Q90 195 135 140"
        stroke="#0B0B0F"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* blush highlight */}
      <ellipse cx="55" cy="55" rx="20" ry="30" fill="#FFF6D6" opacity="0.22" />
    </svg>
  );
}

function MaskTragedy() {
  return (
    <svg width="150" height="190" viewBox="0 0 180 220" fill="none">
      <defs>
        <linearGradient id="t-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#4a2b88" />
        </linearGradient>
      </defs>
      <path
        d="M90 10 C35 10 15 60 20 120 C25 170 60 210 90 210 C120 210 155 170 160 120 C165 60 145 10 90 10 Z"
        fill="url(#t-face)"
        opacity="0.92"
      />
      {/* sad eyes */}
      <path
        d="M50 98 Q62 112 75 98"
        stroke="#0B0B0F"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M105 98 Q118 112 130 98"
        stroke="#0B0B0F"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* frown */}
      <path
        d="M55 170 Q90 135 125 170"
        stroke="#0B0B0F"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* tear */}
      <path d="M64 120 Q66 130 70 140 Q74 130 72 120 Z" fill="#F5F5F7" opacity="0.85" />
      <ellipse cx="55" cy="55" rx="20" ry="30" fill="#FFF6D6" opacity="0.14" />
    </svg>
  );
}
