"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

export type NotifTier = "gold" | "green" | "purple" | "blue" | "red";

export interface Notification {
  id: string;
  tier: NotifTier;
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const TIER_STYLES: Record<NotifTier, { bg: string; fg: string }> = {
  gold:   { bg: "bg-[#E8C872]/15",   fg: "text-[#E8C872]" },
  green:  { bg: "bg-[#10B981]/15",   fg: "text-[#10B981]" },
  purple: { bg: "bg-[#8B5CF6]/15",   fg: "text-[#c4b5fd]" },
  blue:   { bg: "bg-[#60A5FA]/15",   fg: "text-[#60A5FA]" },
  red:    { bg: "bg-[#ef4444]/15",   fg: "text-[#ef4444]" },
};

async function postMarkRead(ids: string[]): Promise<void> {
  // Stub endpoint — returns success regardless.
  await fetch("/api/notifications/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}

export function NotificationsList({ initial }: { initial: Notification[] }) {
  const [items, setItems] = useState<Notification[]>(initial);
  const [, startTransition] = useTransition();

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markRead = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setItems((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)),
    );
    startTransition(async () => {
      await postMarkRead(ids);
    });
  }, []);

  if (items.length === 0) {
    return (
      <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-12 text-center">
        <div className="text-3xl mb-3">🎭</div>
        <p className="text-[#C9C9D1]">You&apos;re all caught up.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#8A8A96]">
          {unread > 0 ? `${unread} unread` : "All read"}
        </p>
        <button
          type="button"
          disabled={unread === 0}
          onClick={() => markRead(items.filter((n) => !n.read).map((n) => n.id))}
          className="text-xs tracking-[0.2em] uppercase text-[#E8C872] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
        >
          Mark all read
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((n) => {
          const tier = TIER_STYLES[n.tier];
          return (
            <li key={n.id}>
              <article
                className={`bg-[#15151C] border rounded-xl p-4 flex items-start gap-4 transition-colors ${
                  n.read
                    ? "border-[#2A2A36] opacity-70"
                    : "border-[#2A2A36] hover:border-[#E8C872]/40"
                }`}
              >
                <div
                  aria-hidden
                  className={`w-10 h-10 rounded-lg grid place-items-center text-lg ${tier.bg} ${tier.fg}`}
                >
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    {n.title}
                    {!n.read && (
                      <span
                        aria-label="unread"
                        className="w-2 h-2 rounded-full bg-[#E8C872]"
                      />
                    )}
                  </h3>
                  <p className="text-sm text-[#8A8A96] mt-1">{n.body}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-[#8A8A96] font-mono">{n.time}</span>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markRead([n.id])}
                      className="text-[10px] tracking-[0.2em] uppercase text-[#E8C872] hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}
