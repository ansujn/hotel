import Link from "next/link";
import { requireSession } from "@/lib/auth";

type Status = "pending" | "signed" | "revoked";

interface ConsentItem {
  token: string;
  asset_id: string;
  asset_title: string;
  student_name: string;
  uploaded_at: string;
  status: Status;
  scope?: {
    channel: boolean;
    social: boolean;
    print: boolean;
    valid_months: number;
  };
  pdf_url?: string;
}

// TODO(backend): replace with `GET /v1/parent/consents` (list all).
async function getConsentsStub(): Promise<ConsentItem[]> {
  return [
    {
      token: "demo-token-1",
      asset_id: "a1",
      asset_title: "Monologue — The Glass Menagerie",
      student_name: "Aarav",
      uploaded_at: new Date().toISOString(),
      status: "pending",
    },
    {
      token: "demo-token-2",
      asset_id: "a2",
      asset_title: "Scene — Andha Yug Act II",
      student_name: "Aarav",
      uploaded_at: new Date(Date.now() - 86400000).toISOString(),
      status: "pending",
    },
    {
      token: "signed-3",
      asset_id: "a3",
      asset_title: "Showcase — Winter 2025",
      student_name: "Aarav",
      uploaded_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      status: "signed",
      scope: { channel: true, social: false, print: false, valid_months: 12 },
      pdf_url: "#",
    },
  ];
}

const statusBadge: Record<Status, string> = {
  pending: "bg-[#E8C872]/15 text-[#E8C872] border-[#E8C872]/40",
  signed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  revoked: "bg-red-500/15 text-red-300 border-red-500/40",
};

export default async function ConsentCenterPage() {
  await requireSession();
  const items = await getConsentsStub();

  return (
    <main className="max-w-6xl mx-auto px-8 pb-16">
      <section className="pt-4 pb-8">
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">
          CONSENT CENTER
        </div>
        <h2 className="serif text-3xl font-black">
          Your child&rsquo;s work, your permission.
        </h2>
        <p className="text-[#8A8A96] mt-2 max-w-prose">
          Every recording that could be shared publicly needs your sign-off.
          You can revoke any consent anytime — the recording is removed from
          public views immediately.
        </p>
      </section>

      <div className="overflow-hidden rounded-2xl border border-[#2A2A36] bg-[#15151C]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0B0B0F] text-[10px] tracking-[0.3em] text-[#8A8A96]">
            <tr>
              <th className="px-5 py-3">ASSET</th>
              <th className="px-5 py-3">UPLOADED</th>
              <th className="px-5 py-3">SCOPE</th>
              <th className="px-5 py-3">STATUS</th>
              <th className="px-5 py-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.token} className="border-t border-[#2A2A36]">
                <td className="px-5 py-4">
                  <div className="serif font-bold">{c.asset_title}</div>
                  <div className="text-xs text-[#8A8A96]">
                    {c.student_name}
                  </div>
                </td>
                <td className="px-5 py-4 text-[#B0B0BA]">
                  {new Date(c.uploaded_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-[#B0B0BA]">
                  {c.scope ? (
                    <span>
                      {[
                        c.scope.channel && "Channel",
                        c.scope.social && "Social",
                        c.scope.print && "Print",
                      ]
                        .filter(Boolean)
                        .join(", ") || "None"}{" "}
                      · {c.scope.valid_months}mo
                    </span>
                  ) : (
                    <span className="text-[#555]">—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${statusBadge[c.status]}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {c.status === "pending" && (
                    <Link
                      href={`/consent/${c.token}`}
                      className="rounded-lg bg-[#E8C872] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#f0d589]"
                    >
                      Sign
                    </Link>
                  )}
                  {c.status === "signed" && c.pdf_url && (
                    <a
                      href={c.pdf_url}
                      className="text-xs text-[#E8C872] underline underline-offset-4 hover:text-[#f0d589]"
                    >
                      View PDF
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
