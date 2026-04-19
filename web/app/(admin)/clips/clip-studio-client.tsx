"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ConsentedAsset {
  id: string;
  title: string;
  student_name?: string;
  duration_s?: number;
}

interface ClipSuggestion {
  start_s: number;
  end_s: number;
  title: string;
  reason: string;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function ClipStudioClient({ token }: { token: string }) {
  const [assets, setAssets] = useState<ConsentedAsset[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [clips, setClips] = useState<ClipSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<ConsentedAsset[]>("/admin/social/library", { token })
      .then(setAssets)
      .catch(() => setAssets([]));
  }, [token]);

  const fetchClips = async (assetId: string) => {
    setSelectedId(assetId);
    if (!assetId) {
      setClips([]);
      return;
    }
    setLoading(true);
    try {
      const result = await api<ClipSuggestion[]>(
        `/admin/assets/${assetId}/clips`,
        { token }
      );
      setClips(result);
    } catch {
      setClips([]);
    } finally {
      setLoading(false);
    }
  };

  const gradients = [
    "from-[#8B5CF6] to-[#E8C872]",
    "from-[#EC4899] to-[#8B5CF6]",
    "from-[#E8C872] to-[#F59E0B]",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="serif text-2xl font-bold text-white">Auto-Clip Studio</h1>
        <p className="text-sm text-[#8A8A96] mt-1">
          AI-powered clip suggestions for social media — pick a video and get 3 high-impact clips
        </p>
      </div>

      {/* Asset selector */}
      <div className="bg-[#0F0F17] border border-[#2A2A36] rounded-xl p-5 mb-6">
        <label className="text-xs text-[#8A8A96] uppercase tracking-wider block mb-2">
          Select a video to analyze
        </label>
        <select
          value={selectedId}
          onChange={(e) => fetchClips(e.target.value)}
          className="w-full max-w-md bg-[#15151C] border border-[#2A2A36] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#E8C872] focus:outline-none"
        >
          <option value="">Choose a consented video...</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} {a.student_name ? `— ${a.student_name}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-[#E8C872]/30 border-t-[#E8C872] rounded-full animate-spin" />
          <p className="text-sm text-[#8A8A96] mt-3">Analyzing video for clip suggestions...</p>
        </div>
      )}

      {/* Clip cards */}
      {!loading && clips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {clips.map((clip, i) => (
            <div
              key={i}
              className="bg-[#0F0F17] border border-[#2A2A36] rounded-xl overflow-hidden hover:border-[#E8C872]/30 transition-colors"
            >
              {/* 9:16 gradient placeholder */}
              <div
                className={`aspect-[9/16] max-h-[320px] bg-gradient-to-br ${gradients[i % gradients.length]} relative flex items-center justify-center`}
              >
                <div className="text-center">
                  <div className="text-black/80 font-bold text-lg">9:16</div>
                  <div className="text-black/60 text-xs mt-1">Vertical Clip</div>
                </div>
                {/* Timestamp badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                  <span className="text-white text-sm font-mono">
                    {formatTime(clip.start_s)} — {formatTime(clip.end_s)}
                  </span>
                  <span className="text-[#8A8A96] text-[10px] ml-2">
                    ({clip.end_s - clip.start_s}s)
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-white font-semibold text-sm">{clip.title}</h3>
                <p className="text-[#8A8A96] text-xs mt-2 leading-relaxed">
                  {clip.reason}
                </p>
                <button
                  onClick={() => {
                    // Navigate to social hub with this asset pre-selected.
                    window.location.href = "/social";
                  }}
                  className="mt-4 w-full min-h-[44px] py-2 rounded-lg bg-[#E8C872]/10 text-[#E8C872] text-sm font-medium border border-[#E8C872]/30 hover:bg-[#E8C872]/20 transition-colors"
                >
                  Send to Social Hub
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && selectedId && clips.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#8A8A96]">No clip suggestions available for this video.</p>
        </div>
      )}

      {!selectedId && !loading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 opacity-30">🎬</div>
          <p className="text-[#8A8A96]">Select a video above to get AI clip suggestions</p>
        </div>
      )}
    </div>
  );
}
