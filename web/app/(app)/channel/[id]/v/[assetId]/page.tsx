import Link from "next/link";
import { notFound } from "next/navigation";
import { MuxPlayer } from "@/components/video/MuxPlayer";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { VideoCard } from "@/components/video/VideoCard";
import { getAsset } from "@/lib/channel-server";

interface PageProps {
  params: Promise<{ id: string; assetId: string }>;
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id, assetId } = await params;
  const res = await getAsset(id, assetId);
  if (!res) notFound();
  const { channel, asset } = res;

  const rubric = Object.entries(asset.rubric ?? {});
  const related = (channel.assets ?? [])
    .filter((a) => a.id !== asset.id && a.type === asset.type)
    .slice(0, 3);
  const created = asset.created_at
    ? new Date(asset.created_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-8 py-6">
        <Link href="/" className="serif text-xl font-black">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-[#C9C9D1]">
          <Link href="/home" className="hover:text-white">Home</Link>
          <Link href={`/channel/${id}`} className="text-white">
            Channel
          </Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-8">
        <Link
          href={`/channel/${id}?tab=${asset.type}`}
          className="text-xs tracking-[0.28em] uppercase text-[#8A8A96] hover:text-[#E8C872]"
        >
          &larr; {channel.student?.name ?? "Channel"}
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-6 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {asset.mux_playback_id ? (
            <MuxPlayer
              playbackId={asset.mux_playback_id}
              token={asset.mux_playback_token}
              title={asset.title}
              autoPlay={false}
            />
          ) : (
            <div className="aspect-video rounded-2xl border border-[#2A2A36] bg-[#15151C] grid place-items-center text-sm text-[#8A8A96]">
              Video is still processing.
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] tracking-[0.28em] text-[#8A8A96] uppercase">
                {asset.type}
              </span>
              <PrivacyBadge privacy={asset.privacy} />
            </div>
            <h1 className="serif text-3xl md:text-4xl font-black leading-tight">
              {asset.title}
            </h1>
            {created && (
              <div className="text-sm text-[#8A8A96] mt-2">{created}</div>
            )}
          </div>

          {rubric.length > 0 && (
            <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-6">
              <h2 className="serif text-lg font-bold mb-4">Rubric</h2>
              <div className="space-y-3">
                {rubric.map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#C9C9D1] capitalize">{k}</span>
                      <span className="text-[#E8C872] font-mono">{v}</span>
                    </div>
                    <div className="h-2 bg-[#0B0B0F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#E8C872]"
                        style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="serif text-base font-bold">Instructor notes</h2>
              <PrivacyBadge privacy="private" />
            </div>
            <p className="text-sm text-[#C9C9D1] leading-relaxed whitespace-pre-wrap">
              {asset.note ??
                "No notes yet. Instructor feedback appears here once recorded."}
            </p>
          </div>

          {related.length > 0 && (
            <div>
              <h2 className="serif text-base font-bold mb-3">More like this</h2>
              <div className="space-y-3">
                {related.map((a) => (
                  <VideoCard key={a.id} asset={a} href={`/channel/${id}/v/${a.id}`} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
