import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { api } from "@/lib/api";
import { requireSession } from "@/lib/auth";

interface StudentRow {
  id: string;
  name: string;
  phone: string;
  batch_name: string;
  parent_name: string;
  asset_count: number;
  consent_status: "none" | "pending" | "signed";
  last_active?: string | null;
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST"
  );
}

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function consentBadge(s: StudentRow["consent_status"]) {
  if (s === "signed") return "public" as const;
  if (s === "pending") return "pending_consent" as const;
  return "private" as const;
}

interface PageProps {
  searchParams: Promise<{ q?: string; batch?: string }>;
}

export default async function AdminStudentsPage({ searchParams }: PageProps) {
  const { q, batch } = await searchParams;
  const { token } = await requireSession();

  let rows: StudentRow[] = [];
  let fetchError: string | null = null;
  try {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (batch && batch !== "all") params.set("batch", batch);
    const qs = params.toString();
    rows = await api<StudentRow[]>(`/admin/students${qs ? `?${qs}` : ""}`, {
      token,
    });
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Failed to load";
  }

  const batches = Array.from(new Set(rows.map((s) => s.batch_name).filter((b) => b && b !== "—")));

  return (
    <main className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-2">
            Admin
          </div>
          <h1 className="serif text-3xl md:text-4xl font-black">Students</h1>
          <p className="text-sm text-[#8A8A96] mt-1">
            {rows.length} on roster · click any row to open their channel.
          </p>
        </div>
        <Link href="/upload">
          <Button variant="primary" size="md">+ Add Student</Button>
        </Link>
      </div>

      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-6 text-sm text-red-300">
          Couldn&rsquo;t load students: {fetchError}
        </div>
      )}

      <form className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-4 mb-6 flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[240px]">
          <Input
            name="q"
            label="Search"
            placeholder="Search name"
            defaultValue={q ?? ""}
          />
        </div>
        <div className="min-w-[200px]">
          <label htmlFor="batch-filter" className="text-xs uppercase tracking-[0.2em] text-[#8A8A96] mb-1.5 block">
            Batch
          </label>
          <select
            id="batch-filter"
            name="batch"
            defaultValue={batch ?? "all"}
            className="h-12 w-full bg-[#15151C] border border-[#2A2A36] rounded-lg px-3 text-[#F5F5F7] focus:outline-none focus:border-[#E8C872]/70"
          >
            <option value="all">All batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <Button variant="ghost" size="md" type="submit">Apply</Button>
      </form>

      <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1C1C26] text-[#8A8A96]">
            <tr className="text-left">
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-[0.2em]">Student</th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-[0.2em]">Batch</th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-[0.2em]">Parent</th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-[0.2em]">Videos</th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-[0.2em]">Consent</th>
              <th className="px-5 py-3 font-medium text-xs uppercase tracking-[0.2em]">Last active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                className="border-t border-[#2A2A36] hover:bg-[#0B0B0F]/60 transition-colors cursor-pointer group"
              >
                <td className="p-0">
                  <Link href={`/channel/${s.id}`} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#E8C872] grid place-items-center text-black text-xs font-bold shrink-0">
                      {initials(s.name)}
                    </div>
                    <div>
                      <div className="font-medium text-white group-hover:text-[#E8C872] transition-colors">
                        {s.name}
                      </div>
                      <div className="text-xs text-[#8A8A96]">{s.phone}</div>
                    </div>
                  </Link>
                </td>
                <td className="p-0">
                  <Link href={`/channel/${s.id}`} className="block px-5 py-4 text-[#C9C9D1]">{s.batch_name}</Link>
                </td>
                <td className="p-0">
                  <Link href={`/channel/${s.id}`} className="block px-5 py-4 text-[#C9C9D1]">{s.parent_name}</Link>
                </td>
                <td className="p-0">
                  <Link href={`/channel/${s.id}`} className="block px-5 py-4 text-[#E8C872] font-mono">{s.asset_count}</Link>
                </td>
                <td className="p-0">
                  <Link href={`/channel/${s.id}`} className="block px-5 py-4">
                    <PrivacyBadge privacy={consentBadge(s.consent_status)} />
                  </Link>
                </td>
                <td className="p-0">
                  <Link href={`/channel/${s.id}`} className="block px-5 py-4 text-[#8A8A96]">{timeAgo(s.last_active)}</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !fetchError && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8A8A96]">
                  No students match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
