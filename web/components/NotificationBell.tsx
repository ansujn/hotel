"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  unreadCount?: number;
  className?: string;
  /** When true, the bell fetches its own unread count from /api/notifications/unread-count. */
  fetchFromApi?: boolean;
}

export function NotificationBell({
  unreadCount = 0,
  className = "",
  fetchFromApi = false,
}: Props) {
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    if (!fetchFromApi) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (!cancelled) setLiveCount(data.count ?? 0);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchFromApi]);

  const effective = fetchFromApi && liveCount !== null ? liveCount : unreadCount;
  const hasUnread = effective > 0;

  return (
    <Link
      href="/notifications"
      aria-label={hasUnread ? `Notifications, ${effective} unread` : "Notifications"}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#2A2A36] bg-[#15151C] text-[#C9C9D1] hover:text-white hover:border-[#E8C872]/50 transition-colors ${className}`}
    >
      <span aria-hidden className="text-sm">🔔</span>
      {hasUnread && (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E8C872] ring-2 ring-[#0B0B0F]"
        />
      )}
    </Link>
  );
}
