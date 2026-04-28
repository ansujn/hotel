"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { Menu as MenuIcon, X } from "lucide-react";

const NAV: { href: Route; label: string }[] = [
  { href: "/menu" as Route, label: "Menu" },
  { href: "/banquets" as Route, label: "Banquets" },
  { href: "/gallery" as Route, label: "Gallery" },
  { href: "/reviews" as Route, label: "Reviews" },
  { href: "/book" as Route, label: "Book" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Transparent at the top of the hero, glass-frost after scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerCls = scrolled
    ? "border-b border-[#D4AF37]/15 bg-[#FBF8F1]/85 backdrop-blur-md text-[#3B1F1A]"
    : "border-b border-transparent bg-transparent text-amber-50";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-colors duration-500 ${headerCls}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href={"/" as Route}
          className="flex items-center gap-3"
          aria-label="Kibana Jaipur — home"
        >
          <span
            className={`grid h-10 w-10 place-items-center rounded-full font-display text-lg ${
              scrolled
                ? "bg-[#3B1F1A] text-[#D4AF37] ring-1 ring-[#D4AF37]/40"
                : "bg-[#D4AF37]/15 text-[#D4AF37] ring-1 ring-[#D4AF37]/50"
            }`}
          >
            K
          </span>
          <span className="font-display text-xl font-light tracking-wide">
            Kibana
            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.4em] opacity-70">
              Jaipur
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[11px] font-semibold uppercase tracking-[0.25em] opacity-80 transition hover:text-[#D4AF37] hover:opacity-100"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href={"/book" as Route}
            className="kib-btn-gold rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
          >
            Reserve
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#D4AF37]/15 bg-[#FBF8F1] text-[#3B1F1A] md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-6 py-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-[#D4AF37]/15 py-3 text-sm font-semibold uppercase tracking-[0.25em]"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={"/book" as Route}
              onClick={() => setOpen(false)}
              className="kib-btn-gold my-4 rounded-full py-3 text-center text-xs font-semibold uppercase tracking-[0.2em]"
            >
              Reserve a table
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
