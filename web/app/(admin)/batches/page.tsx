import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { Button } from "@/components/Button";
import { BatchesBoard, type Batch } from "@/components/BatchesBoard";

// TODO: replace with `GET /v1/admin/batches` once the endpoint lands.
const STUB_BATCHES: Batch[] = [
  {
    id: "batch-thu",
    title: "Thursday Evening",
    schedule: "Thu 6:30–8:30 PM · Theatre",
    students: [
      { id: "s-aarav", name: "Aarav Sharma", initials: "A", gradient: "from-[#8B5CF6] to-[#E8C872]" },
      { id: "s-priya", name: "Priya Menon", initials: "P", gradient: "from-[#ef4444] to-[#E8C872]" },
      { id: "s-ishaan", name: "Ishaan Nair", initials: "I", gradient: "from-[#60A5FA] to-[#10B981]" },
      { id: "s-tara", name: "Tara Joshi", initials: "T", gradient: "from-[#E8C872] to-[#8B5CF6]" },
      { id: "s-ananya", name: "Ananya Rao", initials: "A", gradient: "from-[#ef4444] to-[#8B5CF6]" },
    ],
  },
  {
    id: "batch-sat",
    title: "Saturday Morning",
    schedule: "Sat 10:00–12:00 AM · Public Speaking",
    students: [
      { id: "s-kabir", name: "Kabir Singh", initials: "K", gradient: "from-[#10B981] to-[#8B5CF6]" },
      { id: "s-meera", name: "Meera Iyer", initials: "M", gradient: "from-[#60A5FA] to-[#E8C872]" },
      { id: "s-rohan", name: "Rohan Desai", initials: "R", gradient: "from-[#E8C872] to-[#ef4444]" },
    ],
  },
  {
    id: "batch-sun",
    title: "Sunday Evening",
    schedule: "Sun 5:00–7:00 PM · Kids Drama",
    students: [
      { id: "s-sanya", name: "Sanya Kapoor", initials: "S", gradient: "from-[#8B5CF6] to-[#60A5FA]" },
      { id: "s-vihaan", name: "Vihaan Reddy", initials: "V", gradient: "from-[#10B981] to-[#E8C872]" },
      { id: "s-dev", name: "Dev Patel", initials: "D", gradient: "from-[#60A5FA] to-[#8B5CF6]" },
    ],
  },
];

export default async function AdminBatchesPage() {
  const { user } = await requireSession();
  if (user.role !== "admin" && user.role !== "instructor") {
    redirect("/home");
  }

  return (
    <main className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-2">
            Admin
          </div>
          <h1 className="serif text-3xl md:text-4xl font-black">Batches</h1>
          <p className="text-sm text-[#8A8A96] mt-1">
            Drag students between batches, or use the per-card dropdown.
          </p>
        </div>
        {/* TODO: open an Add Batch modal + POST /v1/admin/batches */}
        <Link href="/students">
          <Button variant="primary" size="md">+ Add Batch</Button>
        </Link>
      </div>

      <BatchesBoard batches={STUB_BATCHES} />
    </main>
  );
}
