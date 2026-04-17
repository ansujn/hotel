"use client";

import { useCallback, useMemo, useState } from "react";
import type { AppNotification, NotificationKind } from "@/lib/api";

interface KindStyle {
  icon: string;
  bg: string;
  fg: string;
}

const KIND_STYLES: Record<NotificationKind, KindStyle> = {
  consent_pending: { icon: "\u2709\uFE0F", bg: "bg-[#E8C872]/15", fg: "text-[#E8C872]" },
  asset_ready:     { icon: "\uD83C\uDFAC", bg: "bg-[#10B981]/15", fg: "text-[#10B981]" },
  feedback:        { icon: "\uD83D\uDCAC", bg: "bg-[#8B5CF6]/15", fg: "text-[#c4b5fd]" },
  class_reminder:  { icon: "\uD83D\uDCC5", bg: "bg-[#60A5FA]/15", fg: "text-[#60A5FA]" },
  fee_due:         { icon: "\uD83D\uDCB3", bg: "bg-[#ef4444]/15", fg: "text-[#ef4444]" },
};

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diffMs = Date.now() - t;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

async function postMarkReadOne(id: string): Promise<boolean> {
  const res = await fetch(`/api/notifications/mark-read?id=${encodeURIComponent(id)}`, {
    method: "POST",
  });
  return res.ok;
}

async function postMarkAll(): Promise<boolean> {
  const res = await fetch(`/api/notifications/mark-read?all=true`, { method: "POST" });
  return res.ok;
}

export function NotificationsList({ initial }: { initial: AppNotification[] }) {
  const [items, setItems] = useState<AppNotification[]>(initial);

  const unread = useMemo(
    () => items.filter((n) => !n.read_at).length,
    [items],
  );

  const markOne = useCallback(async (id: string) => {
    const stamp = new Date().toISOString();
    const prev = items;
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read_at: stamp } : n)));
    const ok = await postMarkReadOne(id);
    if (!ok) setItems(prev);
  }, [items]);

  const markAll = useCallback(async () => {
    const stamp = new Date().toISOString();
    const prev = items;
    setItems((p) => p.map((n) => (n.read_at ? n : { ...n, read_at: stamp })));
    const ok = await postMarkAll();
    if (!ok) setItems(prev);
  }, [items]);

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
          onClick={() => void markAll()}
          className="text-xs tracking-[0.2em] uppercase text-[#E8C872] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
        >
          Mark all read
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((n) => {
          const style = KIND_STYLES[n.kind];
          const isRead = Boolean(n.read_at);
          return (
            <li key={n.id}>
              <article
                className={`bg-[#15151C] border rounded-xl p-4 flex items-start gap-4 transition-colors ${
                  isRead
                    ? "border-[#2A2A36] opacity-70"
                    : "border-[#2A2A36] hover:border-[#E8C872]/40"
                }`}
              >
                <div
                  aria-hidden
                  className={`w-10 h-10 rounded-lg grid place-items-center text-lg ${style.bg} ${style.fg}`}
                >
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    {n.title}
                    {!isRead && (
                      <span
                        aria-label="unread"
                        className="w-2 h-2 rounded-full bg-[#E8C872]"
                      />
                    )}
                  </h3>
                  {n.body && (
                    <p className="text-sm text-[#8A8A96] mt-1">{n.body}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-[#8A8A96] font-mono">
                    {relativeTime(n.created_at)}
                  </span>
                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => void markOne(n.id)}
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
