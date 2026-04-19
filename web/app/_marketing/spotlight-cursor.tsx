"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SpotlightCursor — a slow gold theatrical spotlight that trails the cursor.
 * Fixed-position, GPU-accelerated via translate3d. No-op on touch + reduced-motion.
 */
export function SpotlightCursor() {
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    setEnabled(true);
    target.current = { x: window.innerWidth * 0.5, y: 160 };
    pos.current = { x: window.innerWidth * 0.5, y: 160 };

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.current.x - 420}px, ${pos.current.y - 420}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[3] h-[840px] w-[840px] will-change-transform"
      style={{
        background:
          "radial-gradient(closest-side, rgba(232,200,114,0.14), rgba(232,200,114,0.05) 40%, transparent 72%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
