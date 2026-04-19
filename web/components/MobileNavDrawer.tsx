"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Route } from "next";
import type { User } from "@/lib/api";

export interface NavTab {
  href: string;
  label: string;
}

interface Props {
  tabs: readonly NavTab[];
  activeHref?: string;
  user: User;
}

// Hamburger trigger + slide-in drawer for the admin nav on mobile (<md).
//
// The drawer is portaled to <body> because its ancestor <header> uses
// backdrop-filter — which creates a containing block for `position: fixed`
// and was trapping the drawer inside the 68px header box. Portaling out
// lets `fixed inset-0` anchor to the viewport as intended.
//
// Animation is pure CSS transform (translate-x-full → translate-x-0) to
// avoid any framer-motion positioning quirks on Android Chrome.
export function MobileNavDrawer({ tabs, activeHref, user }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Tab") {
        const root = panelRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    triggerRef.current?.focus({ preventScroll: true });
  }, [open]);

  const close = () => setOpen(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // ignore — redirect anyway
    }
    window.location.assign("/login");
  }

  const initials =
    user.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "VK";

  const drawer = (
    <>
      <div
        onClick={close}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        id="mobile-admin-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal={open ? "true" : "false"}
        aria-label="Admin navigation"
        aria-hidden={!open}
        className={`md:hidden fixed inset-0 z-50 bg-[#0B0B0F] flex flex-col shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none will-change-transform ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#2A2A36]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#E8C872] grid place-items-center text-black text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user.name ?? "Admin"}
              </div>
              <div className="text-xs text-[#8A8A96] truncate">
                {user.email ?? user.phone}
              </div>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-lg border border-[#2A2A36] bg-[#15151C] text-[#C9C9D1] hover:text-white hover:border-[#E8C872]/50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase px-3 mb-2">
            Admin
          </div>
          <ul className="flex flex-col gap-1">
            {tabs.map((t) => {
              const isActive = activeHref === t.href;
              return (
                <li key={t.href}>
                  <Link
                    href={t.href as Route}
                    onClick={close}
                    className={`flex items-center min-h-[48px] px-4 rounded-lg text-base transition-colors ${
                      isActive
                        ? "bg-[#15151C] text-white border border-[#2A2A36] shadow-[0_0_0_1px_rgba(232,200,114,0.35)]"
                        : "text-[#C9C9D1] hover:text-white hover:bg-[#15151C]/80 border border-transparent"
                    }`}
                  >
                    {t.label}
                    {isActive && (
                      <span
                        aria-hidden
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E8C872]"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 py-3 border-t border-[#2A2A36] flex flex-col gap-1">
          <Link
            href={"/account/password" as Route}
            onClick={close}
            className="flex items-center min-h-[48px] px-4 rounded-lg text-base text-[#C9C9D1] hover:text-white hover:bg-[#15151C]/80"
          >
            Change password
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex items-center min-h-[48px] px-4 rounded-lg text-base text-red-300 hover:text-red-200 hover:bg-[#15151C]/80 disabled:opacity-60 text-left"
          >
            {signingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-admin-drawer"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#2A2A36] bg-[#15151C] text-[#F5F5F7] hover:border-[#E8C872]/50 transition-colors"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
