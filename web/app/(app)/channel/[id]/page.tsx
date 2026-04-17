import Link from "next/link";
import { notFound } from "next/navigation";
import { BannerGradient } from "@/components/BannerGradient";
import { VideoCard } from "@/components/video/VideoCard";
import { ASSET_TABS, getChannel, type AssetType } from "@/lib/channel";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

function isTabKey(v: string | undefined): v is AssetType | "about" {
  return (
    v === "monologue" ||
    v === "scene" ||
    v === "showcase" ||
    v === "catalog" ||
    v === "about"
  );
}

export default async function ChannelPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const channel = await getChannel(id);
  if (!channel) notFound();

  const assets = channel.assets ?? [];
  const activeTab = isTabKey(rawTab) ? rawTab : "monologue";
  const filtered =
    activeTab === "about"
      ? []
      : assets.filter((a) => a.type === activeTab);

  const student = channel.student ?? null;
  const initials =
    student?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "ST";

  const counts = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-8 py-6">
        <Link href="/" className="serif text-xl font-black">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-[#C9C9D1]">
          <Link href="/home" className="hover:text-white">Home</Link>
          <span className="text-white">Channel</span>
          <Link href="/progress" className="hover:text-white">Progress</Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-8">
        <BannerGradient className="h-56 md:h-64 flex items-end p-8">
          <div className="relative z-10 flex items-end gap-6 w-full">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-2 border-[#E8C872] bg-gradient-to-br from-[#8B5CF6] to-[#E8C872] grid place-items-center text-black serif text-4xl font-black shrink-0 shadow-[0_20px_60px_-20px_rgba(232,200,114,0.6)]">
              {initials}
            </div>
            <div className="flex-1">
              <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-2">
                Student Channel
              </div>
              <h1 className="serif text-3xl md:text-5xl font-black">
                {student?.name ?? "Student"}
              </h1>
              <div className="mt-2 text-sm text-[#C9C9D1]">
                {student?.batch ?? "Thursday Evening batch"}
              </div>
            </div>
          </div>
        </BannerGradient>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Videos" value={assets.length.toString()} />
          <Stat label="Monologues" value={(counts.monologue ?? 0).toString()} />
          <Stat label="Scenes" value={(counts.scene ?? 0).toString()} />
          <Stat label="Showcases" value={(counts.showcase ?? 0).toString()} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 mt-10">
        <div className="flex gap-1 border-b border-[#2A2A36] overflow-x-auto">
          {ASSET_TABS.map((t) => {
            const isActive = t.key === activeTab;
            return (
              <Link
                key={t.key}
                href={`/channel/${id}?tab=${t.key}`}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  isActive
                    ? "border-[#E8C872] text-white"
                    : "border-transparent text-[#8A8A96] hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-8">
        {activeTab === "about" ? (
          <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-8">
            <h2 className="serif text-xl font-bold mb-3">About {student?.name ?? "Student"}</h2>
            <p className="text-[#C9C9D1] leading-relaxed">
              {student?.bio ??
                "A working artist-in-training at Vik Theatre. Monologues, scenes, and showcase work appear on this channel as consent is granted by parents."}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-12 text-center">
            <div className="serif text-lg font-bold mb-2">Nothing here yet</div>
            <p className="text-sm text-[#8A8A96]">
              Work in this category hasn&rsquo;t been published yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
              <VideoCard
                key={a.id}
                asset={a}
                href={`/channel/${id}/v/${a.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#15151C] border border-[#2A2A36] rounded-xl p-4">
      <div className="text-[10px] tracking-[0.28em] text-[#8A8A96] uppercase">
        {label}
      </div>
      <div className="serif text-2xl font-bold text-[#E8C872] mt-1">{value}</div>
    </div>
  );
}
