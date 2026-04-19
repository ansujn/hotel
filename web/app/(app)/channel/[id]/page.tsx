import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { api, type Note, type Progress, type User } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getChannel } from "@/lib/channel-server";
import type { Asset, Channel } from "@/lib/channel";
import { NotificationBell } from "@/components/NotificationBell";
import { UserMenu } from "@/components/UserMenu";
import { ChannelHero } from "./channel-hero";
import { ChannelStats } from "./channel-stats";
import { FeaturedReel } from "./featured-reel";
import { AssetGrid } from "./asset-grid";
import { DirectorNotes } from "./director-notes";

interface PageProps {
  params: Promise<{ id: string }>;
}

type ViewerRole = "self" | "staff" | "parent" | "public";

function deriveViewer(user: User | null, channelId: string): ViewerRole {
  if (!user) return "public";
  if (user.id === channelId) return "self";
  if (user.role === "admin" || user.role === "instructor") return "staff";
  if (user.role === "parent") return "parent";
  return "public";
}

function filterAssetsForViewer(assets: Asset[], viewer: ViewerRole): Asset[] {
  if (viewer === "public") {
    return assets.filter((a) => a.privacy === "public");
  }
  return assets;
}

function pickFeatured(assets: Asset[]): Asset | null {
  const publicAssets = assets.filter((a) => a.privacy === "public");
  const pool = publicAssets.length > 0 ? publicAssets : assets;
  if (pool.length === 0) return null;
  const sorted = [...pool].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });
  return sorted[0] ?? null;
}

async function fetchNotesForRecentAssets(
  token: string,
  assets: Asset[]
): Promise<{ note: Note; assetTitle?: string }[]> {
  const recent = [...assets]
    .sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 6);

  const results = await Promise.all(
    recent.map(async (a) => {
      try {
        const notes = await api<Note[]>(`/assets/${a.id}/notes`, { token });
        return (notes ?? []).map((n) => ({ note: n, assetTitle: a.title }));
      } catch {
        return [] as { note: Note; assetTitle?: string }[];
      }
    })
  );

  return results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.note.created_at).getTime() -
        new Date(a.note.created_at).getTime()
    );
}

function initialsOf(name?: string): string {
  return (
    name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "ST"
  );
}

function totalRuntimeMinutes(assets: Asset[]): number {
  const s = assets.reduce((acc, a) => acc + (a.duration_s ?? 0), 0);
  return Math.max(0, Math.round(s / 60));
}

function rubricAverage(progress: Progress | null): number {
  if (!progress?.averages?.length) return 0;
  const sum = progress.averages.reduce((acc, d) => acc + (d.score ?? 0), 0);
  return sum / progress.averages.length;
}

function sinceLabel(assets: Asset[]): string | undefined {
  const dates = assets
    .map((a) => (a.created_at ? new Date(a.created_at).getTime() : 0))
    .filter((t) => t > 0);
  if (dates.length === 0) return undefined;
  const earliest = new Date(Math.min(...dates));
  return earliest.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export default async function ChannelPage({ params }: PageProps) {
  const { id } = await params;

  // Session is required for this app route — /login if absent
  const session = await requireSession();
  const viewer = deriveViewer(session.user, id);

  // Parallel fetches. Progress + notes failures must not take down the page.
  const [channelRes, progressRes] = await Promise.all([
    getChannel(id),
    (async () => {
      try {
        return await api<Progress>(`/students/${id}/progress`, {
          token: session.token,
        });
      } catch {
        return null;
      }
    })(),
  ]);

  if (!channelRes) notFound();
  const channel: Channel = channelRes;

  const allAssets = channel.assets ?? [];
  const visibleAssets = filterAssetsForViewer(allAssets, viewer);

  // Notes only for self/parent/staff
  const showNotes = viewer !== "public";
  const notes = showNotes
    ? await fetchNotesForRecentAssets(session.token, visibleAssets)
    : [];

  const student = channel.student;
  const name = student?.name ?? "Student";
  const initials = initialsOf(student?.name);
  const batch = student?.batch;

  const featured = pickFeatured(visibleAssets);
  const runtime = totalRuntimeMinutes(visibleAssets);
  const avg = rubricAverage(progressRes);

  const canUpload = viewer === "self" || viewer === "staff";
  const canScore = viewer === "staff";
  const canSeePrivacy = viewer !== "public";

  const uploadHref = (`/upload?student=${id}` as Route);

  return (
    <main className="min-h-screen grad-hero">
      {/* Top bar */}
      <header className="relative z-30 max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 py-5">
        <Link href="/" className="serif text-xl font-black">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-[#C9C9D1]">
          <Link href="/home" className="hover:text-white">
            Home
          </Link>
          <span className="text-white">Channel</span>
          <Link href="/progress" className="hover:text-white">
            Progress
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <NotificationBell fetchFromApi />
          <UserMenu user={session.user} />
        </div>
      </header>

      <ChannelHero
        name={name}
        initials={initials}
        track="Theatre"
        batch={batch}
        since={sinceLabel(visibleAssets)}
        canUpload={canUpload}
        uploadHref={uploadHref}
        pieceCount={visibleAssets.length}
        runtimeMinutes={runtime}
        avatarUrl={student?.avatar_url}
      />

      {/* Stats strip */}
      <ChannelStats
        stats={[
          { label: "Pieces", value: visibleAssets.length },
          { label: "Runtime", value: runtime, suffix: "min" },
          {
            label: "Rubric Avg",
            value: avg,
            format: "decimal",
            suffix: avg > 0 ? "/5" : undefined,
          },
          {
            label: "Showcases",
            value: visibleAssets.filter((a) => a.type === "showcase").length,
          },
        ]}
      />

      {/* Featured reel */}
      {featured && (
        <FeaturedReel
          asset={featured}
          href={`/channel/${id}/v/${featured.id}`}
        />
      )}

      {/* Body of work + optional notes sidebar */}
      {showNotes ? (
        <div className="max-w-6xl mx-auto px-6 md:px-8 mt-14 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <AssetGrid
              assets={visibleAssets}
              channelId={id}
              canSeePrivacy={canSeePrivacy}
              canScore={canScore}
              canUpload={canUpload}
              uploadHref={uploadHref}
              viewerLabel={viewer}
            />
          </div>
          <div className="order-first lg:order-last">
            <DirectorNotes notes={notes} />
          </div>
        </div>
      ) : (
        <AssetGrid
          assets={visibleAssets}
          channelId={id}
          canSeePrivacy={canSeePrivacy}
          canScore={canScore}
          canUpload={canUpload}
          uploadHref={uploadHref}
          viewerLabel={viewer}
        />
      )}

      {/* About footer — always visible, small */}
      {student?.bio && (
        <section className="max-w-4xl mx-auto px-6 md:px-8 pb-20">
          <div className="rounded-2xl border border-[#2A2A36] bg-[#15151C] p-8 text-center">
            <div className="text-[10px] tracking-[0.4em] text-[#E8C872] uppercase mb-3">
              About {name.split(" ")[0]}
            </div>
            <p className="serif text-lg md:text-xl leading-relaxed text-[#C9C9D1] italic">
              &ldquo;{student.bio}&rdquo;
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
