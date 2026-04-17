"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SocialComposer } from "./social-composer";
import { SocialCalendar } from "./social-calendar";

interface ConsentedAsset {
  id: string;
  title: string;
  student_name?: string;
  mux_playback_id?: string;
  duration_s?: number;
  thumbnail?: string;
}

function formatDuration(s?: number): string {
  if (!s) return "--:--";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function SocialHubClient({ token }: { token: string }) {
  const [assets, setAssets] = useState<ConsentedAsset[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api<ConsentedAsset[]>("/admin/social/library", { token })
      .then(setAssets)
      .catch(() => setAssets([]));
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="serif text-2xl font-bold text-white">Social Hub</h1>
        <p className="text-sm text-[#8A8A96] mt-1">
          Publish student performances to Instagram, YouTube, Facebook, and LinkedIn
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Consented Library */}
        <div className="col-span-3">
          <div className="bg-[#0F0F17] border border-[#2A2A36] rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Library</h2>
            <p className="text-[10px] text-[#8A8A96] uppercase tracking-wider mb-3">
              Consented for social
            </p>
            {assets.length === 0 ? (
              <p className="text-sm text-[#555] py-8 text-center">
                No consented assets yet
              </p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {assets.map((a) => (
                  <div
                    key={a.id}
                    className="bg-[#15151C] border border-[#2A2A36]/60 rounded-lg p-3 hover:border-[#E8C872]/30 transition-colors"
                  >
                    {a.thumbnail ? (
                      <img
                        src={a.thumbnail}
                        alt={a.title}
                        className="w-full h-20 object-cover rounded mb-2"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = "none";
                          const ph = img.nextElementSibling as HTMLElement | null;
                          if (ph) ph.style.display = "block";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-20 rounded mb-2 bg-gradient-to-br from-[#8B5CF6]/30 to-[#E8C872]/20"
                      style={{ display: a.thumbnail ? "none" : "block" }}
                    />

                    <div className="text-sm text-white font-medium truncate">
                      {a.title}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-[#8A8A96]">
                        {a.student_name || "Student"}
                      </span>
                      <span className="text-[11px] text-[#E8C872]">
                        {formatDuration(a.duration_s)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Composer */}
        <div className="col-span-4">
          <div className="bg-[#0F0F17] border border-[#2A2A36] rounded-xl p-5">
            <SocialComposer
              assets={assets}
              token={token}
              onCreated={() => setRefreshKey((k) => k + 1)}
            />
          </div>
        </div>

        {/* Right: Calendar */}
        <div className="col-span-5">
          <div className="bg-[#0F0F17] border border-[#2A2A36] rounded-xl p-4">
            <SocialCalendar token={token} refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
