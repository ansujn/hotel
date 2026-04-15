import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { PrivacyBadge } from "@/components/PrivacyBadge";

// TODO: replace with real `GET /v1/admin/students` once endpoint exists.
interface StudentRow {
  id: string;
  name: string;
  batch: string;
  parent: string;
  videos: number;
  consent: "public" | "pending_consent" | "private";
  last_active: string;
  avatar_initials: string;
}

const STUB_STUDENTS: StudentRow[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Aarav Menon", batch: "Thursday Evening", parent: "Rohan Menon", videos: 12, consent: "public", last_active: "2 hours ago", avatar_initials: "AM" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Ishita Rao", batch: "Thursday Evening", parent: "Sunita Rao", videos: 8, consent: "pending_consent", last_active: "yesterday", avatar_initials: "IR" },
  { id: "33333333-3333-3333-3333-333333333333", name: "Kabir Shah", batch: "Monday Scene Study", parent: "Priya Shah", videos: 5, consent: "private", last_active: "4 days ago", avatar_initials: "KS" },
  { id: "44444444-4444-4444-4444-444444444444", name: "Meera Pillai", batch: "Thursday Evening", parent: "Deepak Pillai", videos: 14, consent: "public", last_active: "just now", avatar_initials: "MP" },
];

interface PageProps {
  searchParams: Promise<{ q?: string; batch?: string }>;
}

export default async function AdminStudentsPage({ searchParams }: PageProps) {
  const { q, batch } = await searchParams;
  const lower = (q ?? "").toLowerCase();
  const rows = STUB_STUDENTS.filter((s) => {
    if (batch && batch !== "all" && s.batch !== batch) return false;
    if (!lower) return true;
    return (
      s.name.toLowerCase().includes(lower) ||
      s.parent.toLowerCase().includes(lower)
    );
  });

  const batches = Array.from(new Set(STUB_STUDENTS.map((s) => s.batch)));

  return (
    <main className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-2">
            Admin
          </div>
          <h1 className="serif text-3xl md:text-4xl font-black">Students</h1>
          <p className="text-sm text-[#8A8A96] mt-1">
            Roster, consent status, and activity at a glance.
          </p>
        </div>
        {/* TODO: wire to POST /v1/admin/students */}
        <Button variant="primary" size="md">+ Add Student</Button>
      </div>

      <form className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-4 mb-6 flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[240px]">
          <Input
            name="q"
            label="Search"
            placeholder="Search name or parent"
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
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-[#2A2A36] hover:bg-[#0B0B0F]/40">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#E8C872] grid place-items-center text-black text-xs font-bold">
                      {s.avatar_initials}
                    </div>
                    <div>
                      <div className="font-medium text-white">{s.name}</div>
                      <div className="text-xs text-[#8A8A96] font-mono">{s.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#C9C9D1]">{s.batch}</td>
                <td className="px-5 py-4 text-[#C9C9D1]">{s.parent}</td>
                <td className="px-5 py-4 text-[#E8C872] font-mono">{s.videos}</td>
                <td className="px-5 py-4"><PrivacyBadge privacy={s.consent} /></td>
                <td className="px-5 py-4 text-[#8A8A96]">{s.last_active}</td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/channel/${s.id}`}
                    className="text-xs tracking-[0.2em] uppercase text-[#E8C872] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8A8A96]">
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
