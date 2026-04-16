"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api, API_BASE } from "@/lib/api";

interface ConsentedAsset {
  id: string;
  title: string;
  student_name?: string;
  mux_playback_id?: string;
  duration_s?: number;
  thumbnail?: string;
}

interface FormData {
  asset_id: string;
  caption: string;
  scheduled_at: string;
}

const PLATFORMS = [
  { id: "ig_reel", label: "IG Reel", icon: "📱" },
  { id: "yt_short", label: "YT Short", icon: "▶" },
  { id: "fb", label: "Facebook", icon: "f" },
  { id: "linkedin", label: "LinkedIn", icon: "in" },
] as const;

export function SocialComposer({
  assets,
  token,
  onCreated,
}: {
  assets: ConsentedAsset[];
  token: string;
  onCreated: () => void;
}) {
  const [platforms, setPlatforms] = useState<string[]>(["ig_reel"]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const selectedAssetId = watch("asset_id");
  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: FormData) => {
    if (platforms.length === 0) return;
    setSubmitting(true);
    try {
      await api("/admin/social/posts", {
        method: "POST",
        token,
        body: {
          asset_id: data.asset_id,
          platforms,
          caption: data.caption,
          scheduled_at: new Date(data.scheduled_at).toISOString(),
        },
      });
      setToast("Post created!");
      setTimeout(() => setToast(null), 3000);
      onCreated();
    } catch (e: any) {
      setToast("Error: " + e.message);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-lg font-semibold text-white">Compose Post</h2>

      {/* Asset selector */}
      <div>
        <label className="text-xs text-[#8A8A96] uppercase tracking-wider">Asset</label>
        <select
          {...register("asset_id", { required: true })}
          className="mt-1 w-full bg-[#15151C] border border-[#2A2A36] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#E8C872] focus:outline-none"
        >
          <option value="">Select a video...</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} {a.student_name ? `— ${a.student_name}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Preview thumbnail */}
      {selectedAsset?.thumbnail && (
        <div className="rounded-lg overflow-hidden border border-[#2A2A36]">
          <img
            src={selectedAsset.thumbnail}
            alt={selectedAsset.title}
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Caption */}
      <div>
        <label className="text-xs text-[#8A8A96] uppercase tracking-wider">Caption</label>
        <textarea
          {...register("caption", { required: "Caption is required" })}
          rows={4}
          placeholder="Write your post caption..."
          className="mt-1 w-full bg-[#15151C] border border-[#2A2A36] rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-[#555] focus:border-[#E8C872] focus:outline-none resize-none"
        />
        {errors.caption && (
          <p className="text-red-400 text-xs mt-1">{errors.caption.message}</p>
        )}
      </div>

      {/* Platforms */}
      <div>
        <label className="text-xs text-[#8A8A96] uppercase tracking-wider mb-2 block">
          Platforms
        </label>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => {
            const active = platforms.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-[#E8C872]/20 text-[#E8C872] border border-[#E8C872]/50"
                    : "bg-[#15151C] text-[#8A8A96] border border-[#2A2A36] hover:border-[#444]"
                }`}
              >
                <span className="mr-1">{p.icon}</span>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule */}
      <div>
        <label className="text-xs text-[#8A8A96] uppercase tracking-wider">Schedule</label>
        <input
          type="datetime-local"
          {...register("scheduled_at", { required: true })}
          className="mt-1 w-full bg-[#15151C] border border-[#2A2A36] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#E8C872] focus:outline-none [color-scheme:dark]"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || platforms.length === 0}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#E8C872] text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {submitting ? "Creating..." : "Create Post"}
      </button>

      {toast && (
        <div
          role="alert"
          className={`text-center text-sm py-2 rounded-lg ${
            toast.startsWith("Error")
              ? "bg-red-500/20 text-red-300"
              : "bg-green-500/20 text-green-300"
          }`}
        >
          {toast}
        </div>
      )}
    </form>
  );
}
