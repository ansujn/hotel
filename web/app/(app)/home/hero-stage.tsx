"use client";

import { useEffect, useRef, useState } from "react";

interface HeroStageProps {
  firstName: string;
  subtitle: string;
  /** e.g. "Student · Batch Tuesday 5pm" */
  playbillLine?: string;
}

/**
 * HeroStage — a 3D proscenium with curtains that part on first visit.
 *
 * Layers (back → front):
 *   0  backstage haze + stage floorboards
 *   1  spotlight cones
 *   2  student's name in a gilded frame
 *   3  left + right velvet curtains (fold open)
 *   4  proscenium arch + masks (comedy/tragedy)
 *
 * Parallax: on pointermove, layers translate at different rates for depth.
 * Touch + reduced-motion users see the static layout, curtains pre-opened.
 */
export function HeroStage({ firstName, subtitle, playbillLine }: HeroStageProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [open, setOpen] = useState(true); // default open for SSR / no-JS
  const [parallaxOn, setParallaxOn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 768;

    // Curtains: animate only on desktop, once per session, and never when reduced motion is on.
    if (!reduce && !coarse && !small) {
      const hasOpened = sessionStorage.getItem("vik.curtains.opened") === "1";
      if (!hasOpened) {
        setOpen(false);
        const t = window.setTimeout(() => {
          setOpen(true);
          sessionStorage.setItem("vik.curtains.opened", "1");
        }, 250);
        return () => window.clearTimeout(t);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;
    setParallaxOn(true);

    const el = frameRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      target.current.x = (e.clientX - cx) / rect.width; // -0.5..0.5
      target.current.y = (e.clientY - cy) / rect.height;
    };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      if (el) {
        el.style.setProperty("--px", current.current.x.toFixed(4));
        el.style.setProperty("--py", current.current.y.toFixed(4));
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

  return (
    <div
      ref={frameRef}
      className="stage relative w-full overflow-hidden rounded-[28px] border border-[#2A2A36] bg-[#0B0B0F]"
      style={{
        aspectRatio: "16 / 9",
        minHeight: 360,
        perspective: "1200px",
      }}
    >
      {/* Layer 0 — backstage haze + floor */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 40%, rgba(139,92,246,0.18), transparent 65%), radial-gradient(60% 60% at 50% 110%, rgba(232,200,114,0.18), transparent 60%), linear-gradient(180deg, #120814 0%, #0B0B0F 70%, #050508 100%)",
          transform: parallaxOn
            ? "translate3d(calc(var(--px,0) * -6px), calc(var(--py,0) * -6px), 0)"
            : undefined,
        }}
      />

      {/* Stage floor boards */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[40%]"
        style={{
          transform: parallaxOn
            ? "translate3d(0, calc(var(--py,0) * -4px), 0) perspective(700px) rotateX(58deg)"
            : "perspective(700px) rotateX(58deg)",
          transformOrigin: "bottom center",
          background:
            "repeating-linear-gradient(90deg, #1a1015 0 48px, #130b10 48px 96px)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 40%, #000 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 40%, #000 100%)",
          opacity: 0.55,
        }}
      />

      {/* Layer 1 — twin spotlight cones */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          transform: parallaxOn
            ? "translate3d(calc(var(--px,0) * -14px), calc(var(--py,0) * -10px), 0)"
            : undefined,
        }}
      >
        <div
          className="absolute left-[18%] top-0 h-[85%] w-[30%] origin-top opacity-70"
          style={{
            background:
              "linear-gradient(180deg, rgba(232,200,114,0.32) 0%, rgba(232,200,114,0.12) 40%, transparent 80%)",
            clipPath: "polygon(45% 0, 55% 0, 100% 100%, 0 100%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="absolute right-[18%] top-0 h-[85%] w-[30%] origin-top opacity-70"
          style={{
            background:
              "linear-gradient(180deg, rgba(139,92,246,0.32) 0%, rgba(139,92,246,0.10) 40%, transparent 80%)",
            clipPath: "polygon(45% 0, 55% 0, 100% 100%, 0 100%)",
            filter: "blur(8px)",
          }}
        />
        {/* Central spotlight pool */}
        <div
          className="absolute left-1/2 top-[34%] h-[70%] w-[70%] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(232,200,114,0.26), rgba(232,200,114,0.06) 40%, transparent 70%)",
          }}
        />
      </div>

      {/* Layer 2 — headline plate (deepest "stage"/back wall) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{
          transform: parallaxOn
            ? "translate3d(calc(var(--px,0) * -22px), calc(var(--py,0) * -14px), 0)"
            : undefined,
        }}
      >
        <div className="text-[10px] sm:text-xs tracking-[0.45em] text-[#E8C872]/80 mb-3">
          ACT I · SCENE I
        </div>
        <h1 className="serif font-black leading-[0.95] text-[clamp(2.5rem,8vw,5.5rem)]">
          Tonight, the stage is{" "}
          <em className="not-italic text-[#E8C872] [text-shadow:0_0_40px_rgba(232,200,114,0.45)]">
            {firstName}
          </em>
          .
        </h1>
        <p className="mt-4 max-w-md text-sm sm:text-base text-[#C9C9D1]">
          {subtitle}
        </p>
        {playbillLine && (
          <div className="mt-6 hidden sm:flex items-center gap-3 text-[10px] tracking-[0.35em] text-[#8A8A96]">
            <span className="h-px w-10 bg-[#E8C872]/50" />
            {playbillLine}
            <span className="h-px w-10 bg-[#E8C872]/50" />
          </div>
        )}
      </div>

      {/* Layer 3 — the velvet curtains. Animated with CSS transitions. */}
      <Curtain side="left" open={open} parallaxOn={parallaxOn} />
      <Curtain side="right" open={open} parallaxOn={parallaxOn} />

      {/* Layer 4 — proscenium arch + masks (closest to viewer) */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: parallaxOn
            ? "translate3d(calc(var(--px,0) * 18px), calc(var(--py,0) * 10px), 0)"
            : undefined,
        }}
      >
        {/* Top valence */}
        <div
          className="absolute inset-x-0 top-0 h-[12%]"
          style={{
            background:
              "linear-gradient(180deg, #1e0810 0%, #2a0a18 60%, transparent 100%)",
          }}
        >
          <div
            className="absolute inset-x-0 bottom-0 h-3"
            style={{
              background:
                "repeating-linear-gradient(90deg, #E8C872 0 12px, transparent 12px 24px)",
              opacity: 0.55,
              maskImage:
                "radial-gradient(100% 80% at 50% 0%, #000 30%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(100% 80% at 50% 0%, #000 30%, transparent 80%)",
            }}
          />
        </div>
        {/* Side pillars */}
        <div className="absolute left-0 inset-y-0 w-3 bg-gradient-to-r from-[#1a0810] to-transparent" />
        <div className="absolute right-0 inset-y-0 w-3 bg-gradient-to-l from-[#1a0810] to-transparent" />
        {/* Tiny masks — hidden on mobile */}
        <div className="absolute top-3 left-5 hidden sm:block text-xl opacity-50" aria-hidden>
          <span className="[text-shadow:0_0_12px_rgba(232,200,114,0.45)]">🎭</span>
        </div>
      </div>
    </div>
  );
}

function Curtain({
  side,
  open,
  parallaxOn,
}: {
  side: "left" | "right";
  open: boolean;
  parallaxOn: boolean;
}) {
  const translate = open
    ? side === "left"
      ? "-105%"
      : "105%"
    : "0%";
  return (
    <div
      aria-hidden
      className={`absolute top-0 bottom-0 ${
        side === "left" ? "left-0" : "right-0"
      } w-1/2`}
      style={{
        transform: `translate3d(${translate}, 0, 0) ${
          parallaxOn
            ? side === "left"
              ? "translate3d(calc(var(--px,0) * -8px), 0, 0)"
              : "translate3d(calc(var(--px,0) * 8px), 0, 0)"
            : ""
        }`,
        transition: "transform 1400ms cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform",
        background:
          side === "left"
            ? "repeating-linear-gradient(90deg, #4a0a1c 0 22px, #6c1028 22px 28px, #3a0716 28px 44px)"
            : "repeating-linear-gradient(-90deg, #4a0a1c 0 22px, #6c1028 22px 28px, #3a0716 28px 44px)",
        boxShadow:
          side === "left"
            ? "inset -30px 0 60px rgba(0,0,0,0.6), inset 10px 0 40px rgba(232,200,114,0.08)"
            : "inset 30px 0 60px rgba(0,0,0,0.6), inset -10px 0 40px rgba(232,200,114,0.08)",
      }}
    >
      {/* Gold rope tieback */}
      <div
        className={`absolute top-1/3 h-2 w-14 rounded-full bg-gradient-to-r from-[#E8C872] to-[#a37d2f] opacity-80 ${
          side === "left" ? "right-2" : "left-2"
        }`}
        style={{
          boxShadow: "0 0 16px rgba(232,200,114,0.55)",
        }}
      />
    </div>
  );
}
