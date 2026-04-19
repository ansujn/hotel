"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { User } from "@/lib/api";

export function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const initials =
    user.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "VK";

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // ignore — we redirect regardless; worst case the cookie is already gone
    }
    window.location.assign("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-full pl-2 pr-1 py-1 hover:bg-[#15151C]/60 transition-colors"
      >
        <div className="text-right text-xs hidden md:block leading-tight">
          <div className="text-white font-medium">{user.name ?? "Admin"}</div>
          <div className="text-[#8A8A96] capitalize">{user.role}</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#E8C872] grid place-items-center text-black text-xs font-bold">
          {initials}
        </div>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-[#15151C] border border-[#2A2A36] rounded-xl shadow-xl overflow-hidden z-30"
        >
          <div className="px-4 py-3 border-b border-[#2A2A36]">
            <div className="text-sm text-white font-medium truncate">
              {user.name ?? "Admin"}
            </div>
            <div className="text-xs text-[#8A8A96] truncate">
              {user.email ?? user.phone}
            </div>
          </div>
          <Link
            href={"/account/password" as Route}
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-[#C9C9D1] hover:bg-[#0B0B0F] hover:text-white"
            onClick={() => setOpen(false)}
          >
            Change password
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={signingOut}
            className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-[#0B0B0F] hover:text-red-200 disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
