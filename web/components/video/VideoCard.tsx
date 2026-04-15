import Link from "next/link";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { formatDuration, type Asset } from "@/lib/channel";

export interface VideoCardProps {
  asset: Asset;
  href?: string;
  className?: string;
}

export function VideoCard({ asset, href, className = "" }: VideoCardProps) {
  const thumb = asset.mux_playback_id
    ? `https://image.mux.com/${asset.mux_playback_id}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`
    : undefined;
  const created = asset.created_at
    ? new Date(asset.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const body = (
    <article
      className={`group relative overflow-hidden rounded-xl bg-[#15151C] border border-[#2A2A36] hover:border-[#E8C872]/40 transition-colors ${className}`}
    >
      <div className="relative aspect-video bg-[#0B0B0F] overflow-hidden">
        {thumb ? (
          // Using <img> intentionally — Mux thumb URLs aren't configured in next/image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={asset.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.45), rgba(232,200,114,0.35))",
            }}
          />
        )}
        <div className="absolute bottom-2 right-2 text-[11px] font-mono bg-black/70 text-white px-1.5 py-0.5 rounded">
          {formatDuration(asset.duration_s)}
        </div>
        <div className="absolute top-2 left-2">
          <PrivacyBadge privacy={asset.privacy} />
        </div>
      </div>
      <div className="p-4">
        <div className="text-[10px] tracking-[0.28em] text-[#8A8A96] uppercase mb-1">
          {asset.type}
        </div>
        <h3 className="serif text-base font-bold leading-snug line-clamp-2">
          {asset.title}
        </h3>
        {created && (
          <div className="mt-2 text-xs text-[#8A8A96]">{created}</div>
        )}
      </div>
    </article>
  );

  return href ? (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60 rounded-xl">
      {body}
    </Link>
  ) : body;
}
