"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SocialPost {
  id: string;
  asset_id?: string;
  platforms: string[];
  caption: string;
  scheduled_at?: string;
  status: string;
  asset_title?: string;
  student_name?: string;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PLATFORM_COLORS: Record<string, string> = {
  ig_reel: "#E1306C",
  yt_short: "#FF0000",
  fb: "#1877F2",
  linkedin: "#0A66C2",
};

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function SocialCalendar({ token, refreshKey }: { token: string; refreshKey: number }) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [posts, setPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    api<SocialPost[]>(`/admin/social/posts?week=${formatDate(weekStart)}`, { token })
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [weekStart, token, refreshKey]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const postsByDay = (day: Date) => {
    const ds = formatDate(day);
    return posts.filter((p) => p.scheduled_at?.startsWith(ds));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Schedule</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() - 7);
              setWeekStart(d);
            }}
            className="px-2 py-1 text-xs text-[#8A8A96] hover:text-white bg-[#15151C] border border-[#2A2A36] rounded"
          >
            Prev
          </button>
          <button
            onClick={() => setWeekStart(getMonday(new Date()))}
            className="px-2 py-1 text-xs text-[#E8C872] bg-[#15151C] border border-[#E8C872]/30 rounded"
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + 7);
              setWeekStart(d);
            }}
            className="px-2 py-1 text-xs text-[#8A8A96] hover:text-white bg-[#15151C] border border-[#2A2A36] rounded"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dayPosts = postsByDay(day);
          const isToday = formatDate(day) === formatDate(new Date());
          return (
            <div
              key={i}
              className={`rounded-lg p-2 min-h-[140px] ${
                isToday
                  ? "bg-[#1A1A2E] border border-[#E8C872]/30"
                  : "bg-[#12121A] border border-[#2A2A36]/50"
              }`}
            >
              <div className="text-center mb-2">
                <div className="text-[10px] text-[#8A8A96] uppercase">{DAY_NAMES[i]}</div>
                <div
                  className={`text-sm font-medium ${
                    isToday ? "text-[#E8C872]" : "text-white"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-1">
                {dayPosts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#0B0B0F] rounded px-1.5 py-1 text-[10px]"
                    title={p.caption}
                  >
                    <div className="text-white truncate">
                      {p.asset_title || p.caption.slice(0, 30)}
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {p.platforms.map((pl) => (
                        <span
                          key={pl}
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: PLATFORM_COLORS[pl] || "#888" }}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[9px] ${
                        p.status === "scheduled"
                          ? "text-green-400"
                          : "text-[#8A8A96]"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
