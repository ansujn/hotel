"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SpotlightCursor — a soft theatrical spotlight that tracks the mouse.
 *
 * Uses transform: translate3d on a fixed-position gradient to stay GPU-accelerated
 * (no layout thrash). Disables itself on touch devices and when the user prefers
 * reduced motion — a static gold glow sits in the corner instead.
 */
export function SpotlightCursor() {
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    setEnabled(true);
    // Start just off-screen so the light eases in from the corner
    targetRef.current = { x: window.innerWidth * 0.5, y: 120 };
    posRef.current = { x: window.innerWidth * 0.5, y: 120 };

    const onMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const tick = () => {
      const dx = targetRef.current.x - posRef.current.x;
      const dy = targetRef.current.y - posRef.current.y;
      posRef.current.x += dx * 0.18;
      posRef.current.y += dy * 0.18;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${posRef.current.x - 320}px, ${posRef.current.y - 320}px, 0)`;
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
      className="pointer-events-none fixed left-0 top-0 z-[5] h-[640px] w-[640px] will-change-transform"
      style={{
        background:
          "radial-gradient(closest-side, rgba(232,200,114,0.16), rgba(232,200,114,0.05) 40%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
