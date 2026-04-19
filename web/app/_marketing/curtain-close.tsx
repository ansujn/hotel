"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Closing curtains. Two panels parked off-screen, then slide in as the user
 * scrolls into the footer. They stop at ~88% of the viewport width so the
 * final gold CTA still reads above them, and fully meet only when the footer
 * is in view. Disabled entirely with prefers-reduced-motion.
 */
export function CurtainClose() {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    setEnabled(true);

    const onScroll = () => {
      const sentinel = sentinelRef.current;
      if (!sentinel || !leftRef.current || !rightRef.current) return;
      const r = sentinel.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress: 0 when sentinel is a full viewport below, 1 when it's at top.
      const raw = 1 - Math.max(0, Math.min(1, r.top / vh));
      const p = Math.pow(raw, 1.4); // ease-in
      const closed = Math.min(p, 1);
      leftRef.current.style.transform = `translate3d(${(closed - 1) * 100}%, 0, 0)`;
      rightRef.current.style.transform = `translate3d(${(1 - closed) * 100}%, 0, 0)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Sentinel: sit roughly where Act V begins */}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      {enabled && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[2]"
          style={{ perspective: "1600px" }}
        >
          <div
            ref={leftRef}
            className="absolute top-0 left-0 bottom-0 w-1/2 will-change-transform"
            style={{
              transform: "translate3d(-100%, 0, 0)",
              background:
                "repeating-linear-gradient(90deg, #4a0a1c 0 22px, #6c1028 22px 28px, #3a0716 28px 44px)",
              boxShadow:
                "inset -60px 0 120px rgba(0,0,0,0.8), inset 10px 0 40px rgba(232,200,114,0.08)",
            }}
          >
            <div
              className="absolute top-1/3 right-3 h-2 w-16 rounded-full opacity-80"
              style={{
                background: "linear-gradient(90deg, #E8C872, #a37d2f)",
                boxShadow: "0 0 16px rgba(232,200,114,0.5)",
              }}
            />
          </div>
          <div
            ref={rightRef}
            className="absolute top-0 right-0 bottom-0 w-1/2 will-change-transform"
            style={{
              transform: "translate3d(100%, 0, 0)",
              background:
                "repeating-linear-gradient(-90deg, #4a0a1c 0 22px, #6c1028 22px 28px, #3a0716 28px 44px)",
              boxShadow:
                "inset 60px 0 120px rgba(0,0,0,0.8), inset -10px 0 40px rgba(232,200,114,0.08)",
            }}
          >
            <div
              className="absolute top-1/3 left-3 h-2 w-16 rounded-full opacity-80"
              style={{
                background: "linear-gradient(90deg, #E8C872, #a37d2f)",
                boxShadow: "0 0 16px rgba(232,200,114,0.5)",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
