"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-30 border-b border-amber-100/70 bg-[#FBF8F1]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href={"/" as Route}
          className="flex items-center gap-2"
          aria-label="Kibana Jaipur — home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#3B1F1A] font-serif text-base font-bold text-amber-50">
            K
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight text-[#3B1F1A]">
            Kibana
            <span className="ml-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
              Jaipur
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-[#3B1F1A]/80 transition hover:text-[#3B1F1A]"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href={"/book" as Route}
            className="rounded-full bg-[#3B1F1A] px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-[#4d2823]"
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
        <div className="border-t border-amber-100 bg-[#FBF8F1] md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-amber-100/60 py-3 text-base text-[#3B1F1A]"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={"/book" as Route}
              onClick={() => setOpen(false)}
              className="my-3 rounded-full bg-[#3B1F1A] py-3 text-center text-sm font-semibold text-amber-50"
            >
              Reserve a table
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
