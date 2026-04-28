"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";
import type { RestaurantVideo } from "@/lib/restaurants-api";

const TYPE_LABEL: Record<RestaurantVideo["type"], string> = {
  ambiance: "Ambiance",
  chef: "Chef's table",
  menu: "Menu walkthrough",
  event: "Events",
};

export function VideoGallery({ videos }: { videos: RestaurantVideo[] }) {
  const [active, setActive] = useState<RestaurantVideo | null>(videos[0] ?? null);

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
        No videos yet — check back soon.
      </div>
    );
  }

  const isLocalVideo = (id: string) => id.startsWith("/");

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="overflow-hidden rounded-2xl bg-black shadow-sm ring-1 ring-slate-200/70">
        {active ? (
          isLocalVideo(active.mux_playback_id) ? (
            <video
              key={active.id}
              src={active.mux_playback_id}
              controls
              style={{ aspectRatio: "16 / 9", width: "100%", height: "auto" }}
              className="bg-black"
            />
          ) : (
            <MuxPlayer
              key={active.id}
              playbackId={active.mux_playback_id}
              metadata={{ video_title: active.title, video_id: active.id }}
              streamType="on-demand"
              accentColor="#0f172a"
              style={{ aspectRatio: "16 / 9", width: "100%", height: "auto" }}
            />
          )
        ) : null}
        {active ? (
          <div className="flex items-center justify-between gap-3 bg-white p-4">
            <div>
              <p className="font-medium text-slate-900">{active.title}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {TYPE_LABEL[active.type]}
              </p>
            </div>
            {typeof active.views === "number" ? (
              <span className="text-xs text-slate-400">{active.views} plays</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {videos.map((v) => {
          const selected = active?.id === v.id;
          return (
            <li key={v.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => setActive(v)}
                className={`flex w-44 items-center gap-3 rounded-xl p-2 text-left transition lg:w-full ${
                  selected
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200/70 hover:bg-slate-50"
                }`}
                aria-pressed={selected}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-semibold ${
                    selected ? "bg-white/15" : "bg-slate-100"
                  }`}
                >
                  ▶
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {v.title}
                  </span>
                  <span
                    className={`block text-xs uppercase tracking-wide ${
                      selected ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {TYPE_LABEL[v.type]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
