interface MarqueeItem {
  label: string;
  text: string;
}

interface MarqueeProps {
  items: MarqueeItem[];
}

/**
 * Old-Broadway style horizontal marquee. Pure CSS keyframes — no JS required,
 * pauses on hover, and freezes (static grid) when the user prefers reduced motion.
 */
export function Marquee({ items }: MarqueeProps) {
  // Duplicate the track so the scroll loops seamlessly.
  const track = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#2A2A36] bg-[linear-gradient(180deg,#170d07_0%,#0f0905_100%)] py-3 md:py-4"
      aria-label="Announcements"
    >
      <style>{`
        @keyframes vik-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .vik-marquee-track {
          animation: vik-marquee 38s linear infinite;
          will-change: transform;
        }
        .vik-marquee-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .vik-marquee-track { animation: none; transform: none; }
        }
      `}</style>

      {/* Amber fade edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
        style={{
          background:
            "linear-gradient(90deg, #0B0B0F 0%, rgba(11,11,15,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
        style={{
          background:
            "linear-gradient(-90deg, #0B0B0F 0%, rgba(11,11,15,0) 100%)",
        }}
      />

      {/* Amber bulb strip */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[6px]"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(232,200,114,0.95) 0 4px, transparent 4px 14px)",
          filter: "blur(0.4px) drop-shadow(0 0 6px rgba(232,200,114,0.5))",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[6px]"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(232,200,114,0.75) 0 4px, transparent 4px 14px)",
          filter: "blur(0.4px) drop-shadow(0 0 6px rgba(232,200,114,0.4))",
        }}
      />

      <div className="vik-marquee-track flex w-max gap-10 whitespace-nowrap">
        {track.map((item, i) => (
          <div key={i} className="flex items-center gap-3 pr-10">
            <span
              className="text-[10px] tracking-[0.35em] font-bold px-2 py-1 rounded"
              style={{
                color: "#0B0B0F",
                background: "#E8C872",
                boxShadow: "0 0 18px rgba(232,200,114,0.45)",
              }}
            >
              {item.label}
            </span>
            <span className="serif text-base md:text-lg text-[#F5F5F7]">
              {item.text}
            </span>
            <span aria-hidden className="text-[#E8C872]/60">★</span>
          </div>
        ))}
      </div>
    </div>
  );
}
