import Link from "next/link";
import type { Route } from "next";
import { requireSession } from "@/lib/auth";
import {
  api,
  type AppNotification,
  type Channel,
  type Progress,
} from "@/lib/api";
import { NotificationBell } from "@/components/NotificationBell";
import { UserMenu } from "@/components/UserMenu";
import { LogoutButton } from "./logout-button";
import { HeroStage } from "./hero-stage";
import { SpotlightCursor } from "./spotlight-cursor";
import { StatStrip, type Stat } from "./stat-strip";
import { PlaybillCarousel } from "./playbill-carousel";
import { RubricRadar } from "./rubric-radar";
import { Marquee } from "./marquee";
import { DirectorNotes } from "./director-notes";
import { Reveal } from "./reveal";

// Render fresh on every visit — this is a personal dashboard.
export const dynamic = "force-dynamic";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good evening";
}

export default async function HomePage() {
  const { user, token } = await requireSession();

  // Role-aware home. Instead of a hard redirect, show a theatrical handoff card
  // so Victor (admin/instructor) and parents aren't dropped on the wrong dashboard
  // but still get the brand moment of "Vik. Theatre" on landing.
  if (user.role === "admin" || user.role === "instructor" || user.role === "parent") {
    return <RoleHandoff role={user.role} name={user.name ?? undefined} />;
  }

  const firstName = (user.name?.split(" ")[0] ?? "friend").trim();

  // Parallelize all reads. Each is independently guarded; partial failure
  // degrades one section to its empty state rather than killing the page.
  const [channel, progress, notifications] = await Promise.all([
    safeGet<Channel>(`/students/${user.id}/channel`, token),
    safeGet<Progress>(`/students/${user.id}/progress`, token),
    // Backend doesn't filter on query string today — we filter for unread below.
    safeGet<AppNotification[]>(`/notifications`, token),
  ]);

  const assets = channel?.assets ?? [];
  const averages = progress?.averages ?? [];
  const timeline = progress?.timeline ?? [];
  const unread = (notifications ?? []).filter((n) => !n.read_at);
  const unreadCount = unread.length;

  // Compute stats. Fallbacks are deliberate zeros so the empty-state copy
  // can take over and invite action rather than flash "--".
  const totalMinutes = assets.reduce(
    (sum, a) => sum + Math.round((a.duration_s ?? 0) / 60),
    0
  );
  const avgRubric = averages.length
    ? averages.reduce((s, d) => s + d.score, 0) / averages.length
    : 0;

  const stats: Stat[] = [
    { label: "PERFORMANCES", value: assets.length, accent: "gold" },
    { label: "MINUTES ON STAGE", value: totalMinutes, accent: "gold" },
    {
      label: "AVG RUBRIC",
      value: avgRubric,
      suffix: "/100",
      decimals: 1,
      accent: "violet",
    },
    { label: "ASSESSED", value: timeline.length, accent: "violet" },
  ];

  // Build marquee items: prefer notifications, fall back to evergreen cues so the
  // ticker never sits empty on a fresh account.
  const marqueeItems = unread.slice(0, 6).map((n) => ({
    label: kindLabel(n.kind),
    text: n.title,
  }));
  const fallbackMarquee = [
    { label: "WELCOME", text: "Your first monologue becomes your first memory here." },
    { label: "UPLOAD", text: "Record on your phone — we handle the rest." },
    { label: "SHOWCASE", text: "Spring showcase auditions open soon." },
    { label: "TIP", text: "Warm up the voice. Warm up the face. Then roll." },
  ];
  const marquee = marqueeItems.length > 0 ? marqueeItems : fallbackMarquee;

  const latest = assets.slice(0, 6);
  const playbillLine = `${greeting()}, ${firstName.toUpperCase()} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`;

  return (
    <main className="relative min-h-screen">
      <SpotlightCursor />

      {/* Ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 500px at 18% 0%, rgba(139,92,246,0.15), transparent 55%), radial-gradient(800px 500px at 85% 110%, rgba(232,200,114,0.12), transparent 60%), #0B0B0F",
        }}
      />

      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 py-6">
        <Link href={"/" as Route} className="serif text-xl font-black">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-[#C9C9D1]">
          <Link href="/home" className="text-white">
            Home
          </Link>
          <Link
            href={`/channel/${user.id}` as Route}
            className="hover:text-white transition-colors"
          >
            Channel
          </Link>
          <Link href="/progress" className="hover:text-white transition-colors">
            Progress
          </Link>
          <Link
            href="/notifications"
            className="hover:text-white transition-colors"
          >
            Inbox
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <NotificationBell unreadCount={unreadCount} />
          <UserMenu user={user} />
        </div>
      </header>

      {/* Hero — the stage */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-2 pb-6 md:pb-10">
        <HeroStage
          firstName={firstName}
          subtitle="Your rehearsal room, your channel, your progress — lights up, when you are."
          playbillLine={playbillLine}
        />
      </section>

      {/* Marquee */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <Reveal>
          <Marquee items={marquee} />
        </Reveal>
      </section>

      {/* Stat strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 md:pt-12">
        <Reveal>
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-[10px] tracking-[0.35em] text-[#E8C872]/80 mb-1">
                THE PROGRAMME
              </div>
              <h3 className="serif text-2xl font-black">Your run so far</h3>
            </div>
            <Link
              href="/progress"
              className="text-xs tracking-widest text-[#8A8A96] hover:text-[#E8C872] transition-colors"
            >
              FULL REPORT →
            </Link>
          </div>
          <StatStrip stats={stats} />
        </Reveal>
      </section>

      {/* Playbill carousel */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-10 md:pt-16">
        <Reveal>
          {latest.length > 0 ? (
            <PlaybillCarousel studentId={user.id} assets={latest} />
          ) : (
            <EmptyPlaybill studentId={user.id} />
          )}
        </Reveal>
      </section>

      {/* Radar + next class */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-10 md:pt-16 grid md:grid-cols-5 gap-5 md:gap-6">
        <Reveal className="md:col-span-3">
          <div className="rounded-2xl border border-[#2A2A36] bg-[#15151C] p-6 md:p-8 h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] tracking-[0.35em] text-[#E8C872]/80 mb-1">
                  YOUR CRAFT
                </div>
                <h3 className="serif text-2xl font-black">The Rubric</h3>
              </div>
              <Link
                href="/progress"
                className="text-xs tracking-widest text-[#8A8A96] hover:text-[#E8C872] transition-colors"
              >
                DETAIL →
              </Link>
            </div>
            {averages.length >= 3 ? (
              <RubricRadar averages={averages} size={360} />
            ) : (
              <EmptyRadar />
            )}
          </div>
        </Reveal>

        <Reveal className="md:col-span-2" delay={120}>
          <NextUpCard />
        </Reveal>
      </section>

      {/* Director's notes */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-10 md:pt-16">
        <Reveal>
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-[10px] tracking-[0.35em] text-[#E8C872]/80 mb-1">
                FROM THE DIRECTOR
              </div>
              <h3 className="serif text-2xl font-black">Notes on your script</h3>
            </div>
            <Link
              href="/progress"
              className="text-xs tracking-widest text-[#8A8A96] hover:text-[#E8C872] transition-colors"
            >
              ALL NOTES →
            </Link>
          </div>
          <DirectorNotes entries={timeline} />
        </Reveal>
      </section>

      {/* Closing curtain */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-16 pb-20">
        <Reveal>
          <div className="relative rounded-2xl border border-[#2A2A36] overflow-hidden p-8 md:p-12 text-center grad-hero">
            <div className="text-[10px] tracking-[0.45em] text-[#E8C872]/80 mb-3">
              CURTAIN CALL
            </div>
            <h3 className="serif text-3xl md:text-5xl font-black leading-tight">
              &ldquo;The stage waits for no one —{" "}
              <em className="not-italic text-[#E8C872]">it waits for you.</em>
              &rdquo;
            </h3>
            <p className="mt-4 text-[#8A8A96] text-sm">
              — Victor, every Saturday, 10:30 AM
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/channel/${user.id}` as Route}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#E8C872] text-black font-semibold hover:bg-[#f0d589] transition-colors shadow-[0_6px_24px_-8px_rgba(232,200,114,0.6)]"
              >
                Open my channel
              </Link>
              <Link
                href="/progress"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-[#2A2A36] bg-transparent hover:bg-[#15151C] transition-colors"
              >
                See my progress
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

async function safeGet<T>(path: string, token: string): Promise<T | null> {
  try {
    return await api<T>(path, { token });
  } catch {
    return null;
  }
}

function kindLabel(kind: AppNotification["kind"]): string {
  switch (kind) {
    case "consent_pending":
      return "CONSENT";
    case "asset_ready":
      return "READY";
    case "feedback":
      return "NOTE";
    case "class_reminder":
      return "CLASS";
    case "fee_due":
      return "BILLING";
    default:
      return "UPDATE";
  }
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function EmptyPlaybill({ studentId }: { studentId: string }) {
  return (
    <div className="relative rounded-2xl border border-dashed border-[#2A2A36] bg-[#15151C]/50 overflow-hidden p-8 md:p-14 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232,200,114,0.12), transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="text-[10px] tracking-[0.45em] text-[#E8C872]/80 mb-2">
          NO. 01 / 01
        </div>
        <h3 className="serif text-3xl md:text-4xl font-black leading-tight">
          Your first spotlight awaits.
        </h3>
        <p className="mt-3 text-[#C9C9D1] max-w-lg mx-auto">
          Upload a monologue and the stage lights come up — your channel, your
          playbill, your run. It all starts with one take.
        </p>
        <Link
          href={`/channel/${studentId}` as Route}
          className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#E8C872] text-black font-semibold hover:bg-[#f0d589] transition-colors shadow-[0_6px_24px_-8px_rgba(232,200,114,0.6)]"
        >
          Open my channel
        </Link>
      </div>
    </div>
  );
}

function EmptyRadar() {
  return (
    <div className="min-h-[300px] grid place-items-center text-center px-6">
      <div>
        <div className="text-[10px] tracking-[0.35em] text-[#E8C872]/80 mb-2">
          UNSCORED
        </div>
        <p className="serif text-xl font-bold">
          Your rubric chart wakes up after your first review.
        </p>
        <p className="mt-2 text-sm text-[#8A8A96] max-w-sm mx-auto">
          Diction, Confidence, Improvisation, Memorization, Stage Presence —
          five dimensions plotted as you perform.
        </p>
      </div>
    </div>
  );
}

function NextUpCard() {
  const now = new Date();
  const day = now.getDay(); // 0 Sun ... 6 Sat
  // Theatre classes: target the upcoming Saturday 10:30am
  const delta = (6 - day + 7) % 7 || 7;
  const sat = new Date(now);
  sat.setDate(sat.getDate() + delta);
  sat.setHours(10, 30, 0, 0);
  const label = sat.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="rounded-2xl border border-[#2A2A36] bg-[#15151C] p-6 md:p-8 h-full flex flex-col">
      <div className="text-[10px] tracking-[0.35em] text-[#E8C872]/80 mb-2">
        NEXT IN THE GREEN ROOM
      </div>
      <div className="serif text-2xl md:text-3xl font-black leading-tight">
        {label}
      </div>
      <div className="serif text-[#E8C872] text-xl font-bold mt-1">
        10:30 AM · Black Box
      </div>
      <div className="mt-4 space-y-3 text-sm text-[#C9C9D1]">
        <div className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5">🎬</span>
          <span>
            Partner scene from{" "}
            <em className="not-italic text-white">The Glass Menagerie</em>.
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5">📜</span>
          <span>Bring a printed script &amp; two warm-up exercises.</span>
        </div>
        <div className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5">🎙️</span>
          <span>Voice check at 10:15 sharp.</span>
        </div>
      </div>

      <div
        className="mt-auto pt-6 flex items-center gap-3"
        aria-hidden
      >
        <div className="h-[1px] flex-1 bg-[#2A2A36]" />
        <span className="text-[10px] tracking-[0.3em] text-[#8A8A96]">INTERMISSION SOON</span>
        <div className="h-[1px] flex-1 bg-[#2A2A36]" />
      </div>
    </div>
  );
}

function RoleHandoff({
  role,
  name,
}: {
  role: "admin" | "instructor" | "parent";
  name?: string;
}) {
  const first = name?.split(" ")[0] ?? (role === "parent" ? "there" : "there");
  const href =
    role === "parent" ? ("/parent" as Route) : ("/students" as Route);
  const label =
    role === "parent" ? "Open parent dashboard" : "Head to /students";
  const copy =
    role === "parent"
      ? "Your child's performances and consent flow live on the parent dashboard."
      : "Your roster, batches, and reviews live on the staff dashboard.";

  return (
    <main className="relative min-h-screen grid place-items-center px-6">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 grad-login opacity-60"
      />
      <div className="max-w-lg w-full rounded-2xl border border-[#2A2A36] bg-[#15151C]/80 backdrop-blur p-8 md:p-10 text-center">
        <div className="serif text-xl font-black mb-6">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </div>
        <div className="text-[10px] tracking-[0.45em] text-[#E8C872]/80 mb-3">
          WELCOME BACK
        </div>
        <h1 className="serif text-3xl md:text-4xl font-black leading-tight">
          Hello, <em className="not-italic text-[#E8C872]">{first}</em>.
        </h1>
        <p className="mt-4 text-[#C9C9D1]">{copy}</p>
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#E8C872] text-black font-semibold hover:bg-[#f0d589] transition-colors shadow-[0_6px_24px_-8px_rgba(232,200,114,0.6)]"
        >
          {label}
        </Link>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
