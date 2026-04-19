import Link from "next/link";
import type { Route } from "next";
import { requireSession } from "@/lib/auth";
import {
  api,
  type AppNotification,
  type Channel,
  type Payment,
  type Progress,
} from "@/lib/api";
import { HeroCard, type ChildSummary } from "./hero-card";
import { ProgressChart, type ProgressPoint } from "./progress-chart";
import { MilestonesStrip, type Milestone } from "./milestones-strip";
import { ConsentList, type ConsentRow } from "./consent-list";
import { FeesCard, type FeeStatus } from "./fees-card";
import { DirectorNotes, type DirectorNote } from "./director-notes";
import { Reveal } from "./reveal";

// ---------- helpers ----------

function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  return fn().catch(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[parent] ${label} failed — using fallback.`);
    }
    return null;
  });
}

function monthLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { month: "short" });
  } catch {
    return "";
  }
}

function averageScore(scores: Array<{ score: number }>): number {
  if (scores.length === 0) return 0;
  return scores.reduce((s, x) => s + x.score, 0) / scores.length;
}

/** Roll up a progress timeline into month-aggregated points (up to 8). */
function buildProgressPoints(progress: Progress | null): ProgressPoint[] {
  if (!progress?.timeline?.length) return [];
  const bucket = new Map<string, { label: string; sum: number; n: number; ts: number }>();
  for (const entry of progress.timeline) {
    try {
      const d = new Date(entry.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const avg = averageScore(entry.scores ?? []);
      const b = bucket.get(key);
      if (b) {
        b.sum += avg;
        b.n += 1;
      } else {
        bucket.set(key, { label: monthLabel(entry.date), sum: avg, n: 1, ts: d.getTime() });
      }
    } catch {
      /* skip */
    }
  }
  return Array.from(bucket.values())
    .sort((a, b) => a.ts - b.ts)
    .slice(-8)
    .map((b) => ({ label: b.label, value: Math.round(b.sum / b.n) }));
}

/** Map published channel assets to playbill milestone cards. */
function buildMilestones(channel: Channel | null, studentId: string): Milestone[] {
  if (!channel?.assets?.length) return [];
  return channel.assets
    .filter((a) => a.privacy === "public")
    .slice(0, 6)
    .map<Milestone>((a) => ({
      id: a.id,
      title: a.title,
      subtitle: a.type === "scene" ? "Scene" : a.type === "monologue" ? "Monologue" : a.type === "showcase" ? "Showcase" : undefined,
      date: a.created_at,
      channelHref: `/channel/${studentId}#asset-${a.id}`,
    }));
}

/** Derive consent rows from notifications + channel (best-effort until a
 * dedicated list endpoint exists). */
function buildConsentRows(
  notifications: AppNotification[],
  channel: Channel | null,
): { rows: ConsentRow[]; pending: number } {
  const pendingFromNotif: ConsentRow[] = notifications
    .filter((n) => n.kind === "consent_pending")
    .slice(0, 5)
    .map<ConsentRow>((n) => ({
      id: n.id,
      assetTitle: n.title.replace(/^Consent needed:\s*/i, "") || "New recording",
      status: "pending",
      actionHref: "/parent/consent",
    }));

  const signedFromChannel: ConsentRow[] = (channel?.assets ?? [])
    .filter((a) => a.privacy === "public")
    .slice(0, 4)
    .map<ConsentRow>((a) => {
      // Assume signed-at = created_at for display purposes, valid 12mo.
      const signedAt = a.created_at;
      let validUntil: string | undefined;
      try {
        const d = new Date(signedAt);
        d.setFullYear(d.getFullYear() + 1);
        validUntil = d.toISOString();
      } catch {
        /* noop */
      }
      return {
        id: a.id,
        assetTitle: a.title,
        status: "signed",
        signedAt,
        validUntil,
        scope: { channel: true },
        actionHref: "/parent/consent",
      };
    });

  return {
    rows: [...pendingFromNotif, ...signedFromChannel].slice(0, 5),
    pending: pendingFromNotif.length,
  };
}

function inferFeeStatus(
  dues: { pending: boolean; amount_paise?: number; period?: string } | null,
  payments: Payment[],
): FeeStatus {
  if (!dues?.pending) return "paid";
  // Crude: if any payment for this period failed → overdue.
  if (
    dues.period &&
    payments.some((p) => p.period === dues.period && p.status === "failed")
  ) {
    return "overdue";
  }
  return "due";
}

function buildNotes(notifications: AppNotification[]): DirectorNote[] {
  return notifications
    .filter((n) => n.kind === "feedback" && n.body)
    .slice(0, 3)
    .map<DirectorNote>((n) => ({
      id: n.id,
      body: n.body ?? "",
      authorName: "Your instructor",
      context: n.title,
      createdAt: n.created_at,
    }));
}

// ---------- page ----------

interface PageProps {
  searchParams: Promise<{ child?: string }>;
}

export default async function ParentHomePage({ searchParams }: PageProps) {
  const { user, token } = await requireSession();
  const { child: selectedChildParam } = await searchParams;
  const parentName = user.name?.split(" ")[0] ?? "Parent";

  // TODO(backend): add `GET /v1/parent/children` to return linked students.
  // Until then, the parent page depends on a single student link; we fall back
  // to the authenticated user's own id if no link is known (dev/demo).
  const activeChildId = selectedChildParam ?? user.id;

  // Fetch in parallel; each call is isolated so a single failure doesn't
  // blank the page.
  const [channel, progress, dues, payments, notifications] = await Promise.all([
    safe("channel", () => api<Channel>(`/students/${activeChildId}/channel`, { token })),
    safe("progress", () => api<Progress>(`/students/${activeChildId}/progress`, { token })),
    safe("dues", () =>
      api<{ pending: boolean; amount_paise?: number; period?: string }>("/payments/dues", { token }),
    ),
    safe("payments", () => api<Payment[]>("/payments", { token })),
    safe("notifications", () => api<AppNotification[]>("/notifications", { token })),
  ]);

  const childName = channel?.student?.name ?? "Your child";
  const childInitials = (channel?.student?.name ?? "ST")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const activeChild: ChildSummary = {
    id: activeChildId,
    name: childName,
    batchName: undefined, // not exposed by /students/:id/channel yet
    enrolledSince: channel?.assets?.length
      ? channel.assets[channel.assets.length - 1]?.created_at
      : undefined,
    assetCount: channel?.assets?.length,
    initials: childInitials,
  };

  // Single-child for now; siblings hook-in point ready for /parent/children.
  const siblings: ChildSummary[] = [activeChild];

  const progressPoints = buildProgressPoints(progress);
  const milestones = buildMilestones(channel, activeChildId);
  const { rows: consentRows, pending: pendingConsent } = buildConsentRows(
    notifications ?? [],
    channel,
  );
  const feeStatus = inferFeeStatus(dues, payments ?? []);
  const directorNotes = buildNotes(notifications ?? []);

  const noChildLinked = channel === null && !selectedChildParam;

  return (
    <main className="relative max-w-6xl mx-auto px-5 sm:px-8 pb-24 pt-2">
      {noChildLinked ? (
        <EmptyChildState parentName={parentName} />
      ) : (
        <>
          <HeroCard
            parentFirstName={parentName}
            child={activeChild}
            siblings={siblings}
            activeChildId={activeChildId}
          />

          {pendingConsent > 0 && (
            <Reveal delay={0.1} className="mt-10">
              <div
                role="alert"
                className="flex items-start gap-4 rounded-2xl border border-[#E8C872]/40 bg-[#E8C872]/10 p-5"
              >
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8C872]/20 text-[#E8C872] serif text-lg"
                >
                  !
                </span>
                <div className="flex-1">
                  <div className="serif text-lg font-bold text-[#E8C872]">
                    {pendingConsent} new recording{pendingConsent > 1 ? "s" : ""} need your consent
                  </div>
                  <p className="mt-1 text-sm text-[#C9C9D1]">
                    Please review and sign so {childName}&rsquo;s work can be shared safely on the channel and social.
                  </p>
                </div>
                <Link
                  href={"/parent/consent" as Route}
                  className="shrink-0 rounded-lg bg-[#E8C872] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0d589] transition-colors"
                >
                  Review
                </Link>
              </div>
            </Reveal>
          )}

          {/* Quick stats */}
          <Reveal delay={0.15} className="mt-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat
                label="Recordings"
                value={channel?.assets?.length ?? 0}
                hint="in the archive"
              />
              <Stat
                label="Published"
                value={channel?.assets?.filter((a) => a.privacy === "public").length ?? 0}
                hint="publicly shared"
              />
              <Stat
                label="Consents"
                value={pendingConsent}
                hint={pendingConsent > 0 ? "awaiting you" : "all up to date"}
                accent={pendingConsent > 0}
              />
              <Stat
                label="Fees"
                value={feeStatus === "paid" ? "Paid" : feeStatus === "overdue" ? "Overdue" : "Due"}
                hint={feeStatus === "paid" ? "thank you" : "action needed"}
                accent={feeStatus !== "paid"}
              />
            </div>
          </Reveal>

          {/* Progress chart */}
          <div className="mt-12">
            <ProgressChart
              subtitle={
                progressPoints.length > 0
                  ? `${childName}'s rubric average, month by month.`
                  : undefined
              }
              points={progressPoints}
            />
          </div>

          {/* Milestones */}
          <div className="mt-14">
            <MilestonesStrip
              items={milestones}
              viewAllHref={`/channel/${activeChildId}`}
            />
          </div>

          {/* Two-col: consent + fees */}
          <div className="mt-14 grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <ConsentList
                pendingCount={pendingConsent}
                items={consentRows}
                viewAllHref="/parent/consent"
              />
            </div>
            <div className="lg:col-span-2">
              <FeesCard
                status={feeStatus}
                currentPeriod={dues?.period}
                amountPaise={dues?.amount_paise}
                nextDueOn={undefined}
                payHref="/parent/fees"
                recentPayments={(payments ?? []).slice(0, 4).map((p) => ({
                  id: p.id,
                  period: p.period ?? "—",
                  amountPaise: p.amount_paise,
                  status: p.status,
                  createdAt: p.created_at,
                }))}
              />
            </div>
          </div>

          {/* Director's notes */}
          {directorNotes.length > 0 && (
            <div className="mt-16">
              <DirectorNotes notes={directorNotes} />
            </div>
          )}
        </>
      )}
    </main>
  );
}

// ---------- small bits ----------

function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        accent
          ? "border-[#E8C872]/30 bg-[#E8C872]/5"
          : "border-[#2A2A36] bg-[#15151C]"
      }`}
    >
      <div className="text-[10px] tracking-[0.3em] text-[#8A8A96] uppercase">
        {label}
      </div>
      <div
        className={`serif mt-2 text-3xl font-black ${
          accent ? "text-[#E8C872]" : "text-[#F5F5F7]"
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-[#8A8A96]">{hint}</div>}
    </div>
  );
}

function EmptyChildState({ parentName }: { parentName: string }) {
  return (
    <section className="mt-16 rounded-3xl border border-[#2A2A36] bg-gradient-to-br from-[#15151C] to-[#1A1030] p-10 md:p-16 text-center">
      <div className="text-[11px] tracking-[0.4em] text-[#E8C872]">
        WELCOME, {parentName.toUpperCase()}
      </div>
      <h2 className="serif mt-5 text-3xl md:text-5xl font-black">
        We{"\u2019"}re still <em className="not-italic text-[#E8C872]">connecting</em>
        <br />
        your child{"\u2019"}s profile.
      </h2>
      <p className="mt-5 text-[#C9C9D1] max-w-lg mx-auto">
        Your instructor will link your profile to your child{"\u2019"}s once their batch is confirmed. This usually happens within a day of enrolment.
      </p>
      <p className="mt-6 text-sm text-[#8A8A96]">
        Need help? Message your instructor{" "}
        <span className="text-[#E8C872]">directly on WhatsApp</span>.
      </p>
    </section>
  );
}
