"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";

/**
 * Sticky nav that fades to a glass bar after scroll. Includes an optional
 * stage-door chime toggle — muted by default, only plays on explicit click.
 * Audio is generated at runtime via WebAudio so there's no MP3 to download.
 */
export function StageNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const playChime = () => {
    try {
      const AC: typeof AudioContext | undefined =
        (typeof window !== "undefined" &&
          ((window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
            .AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext)) ||
        undefined;
      if (!AC) return;
      if (!ctxRef.current) ctxRef.current = new AC();
      const ctx = ctxRef.current;
      const now = ctx.currentTime;
      // Two-note stage-door chime
      const notes: Array<[number, number]> = [
        [660, now],
        [880, now + 0.18],
      ];
      notes.forEach(([freq, t]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.15, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1);
      });
    } catch {
      /* ignore */
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) playChime();
  };

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-[40] transition-colors"
      style={{
        background: scrolled
          ? "rgba(11,11,15,0.72)"
          : "transparent",
        backdropFilter: scrolled ? "saturate(160%) blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(160%) blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(42,42,54,0.7)"
          : "1px solid transparent",
      }}
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8 py-4 md:py-5">
        <Link
          href={"/" as Route}
          className="serif text-xl md:text-2xl font-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/70 rounded"
        >
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#C9C9D1]">
          <a href="#classes" className="hover:text-white transition-colors">
            Classes
          </a>
          <a href="#inside" className="hover:text-white transition-colors">
            Inside
          </a>
          <a href="#voices" className="hover:text-white transition-colors">
            Voices
          </a>
          <a href="#about" className="hover:text-white transition-colors">
            About
          </a>
          <Link href={"/faq" as Route} className="hover:text-white transition-colors">
            FAQ
          </Link>
          <a
            href="mailto:hello@viktheatre.in"
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute ambient chime" : "Play stage-door chime"}
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2A36] text-[#C9C9D1] hover:border-[#E8C872]/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60"
          >
            {soundOn ? <IconSpeaker /> : <IconSpeakerMuted />}
          </button>
          <Link href={"/login" as Route} className="hidden sm:inline-flex">
            <Button variant="ghost" size="md">
              Login
            </Button>
          </Link>
          <Link href={"/login" as Route}>
            <Button variant="primary" size="md">
              Book Trial
            </Button>
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2A36] text-[#C9C9D1]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              {menuOpen ? (
                <path
                  d="M6 6 L18 18 M18 6 L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7 H20 M4 12 H20 M4 17 H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="md:hidden border-t border-[#2A2A36] bg-[#0B0B0F]/95 backdrop-blur px-5 py-4 space-y-3 text-sm text-[#C9C9D1]"
          role="menu"
        >
          <a href="#classes" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Classes
          </a>
          <a href="#inside" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Inside a class
          </a>
          <a href="#voices" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Voices
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)} className="block py-1.5">
            About
          </a>
          <Link href={"/faq" as Route} onClick={() => setMenuOpen(false)} className="block py-1.5">
            FAQ
          </Link>
          <a href="mailto:hello@viktheatre.in" onClick={() => setMenuOpen(false)} className="block py-1.5">
            Contact
          </a>
        </div>
      )}
    </nav>
  );
}

function IconSpeaker() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 10 H8 L13 6 V18 L8 14 H5 Z"
        fill="currentColor"
      />
      <path
        d="M16 9 Q18 12 16 15 M18 7 Q22 12 18 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
function IconSpeakerMuted() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 10 H8 L13 6 V18 L8 14 H5 Z"
        fill="currentColor"
      />
      <path
        d="M16 9 L22 15 M22 9 L16 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
