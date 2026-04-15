"use client";

import MuxPlayerReact from "@mux/mux-player-react";

export interface MuxPlayerProps {
  playbackId: string;
  token?: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
}

export function MuxPlayer({
  playbackId,
  token,
  title,
  poster,
  autoPlay = false,
}: MuxPlayerProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#2A2A36] bg-black aspect-video">
      <MuxPlayerReact
        streamType="on-demand"
        playbackId={playbackId}
        tokens={token ? { playback: token } : undefined}
        metadata={title ? { video_title: title } : undefined}
        poster={poster}
        autoPlay={autoPlay}
        accentColor="#E8C872"
        style={{
          // @ts-expect-error css custom props supported by mux-player
          "--controls-backdrop-color": "rgba(11,11,15,0.7)",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
