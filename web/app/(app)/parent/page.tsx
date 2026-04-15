import Link from "next/link";
import { requireSession } from "@/lib/auth";

// TODO(backend): replace stub with `GET /v1/parent/consents/pending`
// (endpoint not yet defined in openapi.yaml — Agent A to add).
interface PendingConsent {
  token: string;
  asset_title: string;
  uploaded_at: string;
  student_name: string;
}

async function getPendingConsentsStub(): Promise<PendingConsent[]> {
  return [
    {
      token: "demo-token-1",
      asset_title: "Monologue — The Glass Menagerie",
      uploaded_at: new Date().toISOString(),
      student_name: "Aarav",
    },
    {
      token: "demo-token-2",
      asset_title: "Scene — Andha Yug Act II",
      uploaded_at: new Date(Date.now() - 86400000).toISOString(),
      student_name: "Aarav",
    },
  ];
}

export default async function ParentHomePage() {
  const { user } = await requireSession();
  const parentName = user.name?.split(" ")[0] ?? "Parent";
  // TODO: once /parent/children endpoint exists, use first linked child.
  const childName = "Aarav";

  const pending = await getPendingConsentsStub();

  return (
    <main className="max-w-6xl mx-auto px-8 pb-16">
      <section className="pt-4 pb-8">
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">
          WELCOME
        </div>
        <h2 className="serif text-4xl font-black">
          Hello, <em className="text-[#E8C872] not-italic">{parentName}</em>.
        </h2>
        <p className="text-[#8A8A96] mt-2">
          Here&rsquo;s how {childName} is doing this week.
        </p>
      </section>

      {pending.length > 0 && (
        <div
          role="alert"
          className="mb-8 flex items-start gap-4 rounded-2xl border border-[#E8C872]/40 bg-[#E8C872]/10 p-5"
        >
          <div className="text-2xl" aria-hidden>
            ⚠️
          </div>
          <div className="flex-1">
            <div className="serif text-lg font-bold text-[#E8C872]">
              {pending.length} new item{pending.length > 1 ? "s" : ""} need
              your consent
            </div>
            <p className="mt-1 text-sm text-[#C9C9D1]">
              Please review and sign so {childName}&rsquo;s work can be shared
              safely.
            </p>
          </div>
          <Link
            href="/parent/consent"
            className="shrink-0 rounded-lg bg-[#E8C872] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0d589]"
          >
            Review
          </Link>
        </div>
      )}

      <section className="rounded-2xl border border-[#2A2A36] bg-gradient-to-br from-[#15151C] via-[#15151C] to-[#1A1030] p-8">
        <div className="text-xs tracking-[0.3em] text-[#E8C872]">
          {childName.toUpperCase()}&rsquo;S JOURNEY
        </div>
        <h3 className="serif mt-3 text-2xl font-bold">
          3 new recordings this term · 8 classes attended
        </h3>
        <p className="mt-2 text-[#B0B0BA]">
          Scene work has deepened — diction +5, stage presence +3 since the
          last showcase.
        </p>
      </section>

      <section className="mt-6 grid md:grid-cols-3 gap-5">
        <Card title="Recent uploads" value="3" sub="This month" href="/parent/consent" />
        <Card title="Attendance" value="92%" sub="Last 30 days" />
        <Card title="Fees" value="Paid" sub="Next due Jun 5" href="/parent/fees" />
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="serif text-base font-bold">Consent Center</h4>
          <Link
            href="/parent/consent"
            className="text-xs tracking-widest text-[#8A8A96] hover:text-white"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="space-y-3">
          {pending.slice(0, 3).map((c) => (
            <Link
              key={c.token}
              href={`/consent/${c.token}`}
              className="flex items-center justify-between rounded-xl border border-[#2A2A36] bg-[#15151C] p-5 hover:border-[#E8C872]/40 transition-colors"
            >
              <div>
                <div className="text-[10px] tracking-[0.3em] text-[#E8C872] mb-1">
                  PENDING CONSENT
                </div>
                <div className="serif text-lg font-bold">{c.asset_title}</div>
                <div className="text-xs text-[#8A8A96]">
                  {c.student_name} ·{" "}
                  {new Date(c.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <span className="text-sm text-[#E8C872]">Review →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Card({
  title,
  value,
  sub,
  href,
}: {
  title: string;
  value: string;
  sub: string;
  href?: string;
}) {
  const body = (
    <>
      <h4 className="serif text-base font-bold">{title}</h4>
      <div className="serif mt-3 text-4xl font-bold text-[#E8C872]">
        {value}
      </div>
      <div className="mt-1 text-xs text-[#8A8A96]">{sub}</div>
    </>
  );
  const cls =
    "rounded-2xl border border-[#2A2A36] bg-[#15151C] p-6 hover:border-[#E8C872]/40 transition-colors block";
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
