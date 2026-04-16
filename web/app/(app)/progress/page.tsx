import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { RadarChart } from "@/components/RadarChart";

interface DimScore {
  dimension: string;
  score: number;
}

interface Assessment {
  date: string;
  asset_id: string;
  asset_title: string;
  scores: DimScore[];
  note?: string;
}

interface ProgressReport {
  averages: DimScore[];
  timeline: Assessment[];
}

// Fallback data for when API is unavailable (dev/demo mode)
const FALLBACK_REPORT: ProgressReport = {
  averages: [
    { dimension: "Confidence", score: 78 },
    { dimension: "Diction", score: 85 },
    { dimension: "Improvisation", score: 62 },
    { dimension: "Memorization", score: 90 },
    { dimension: "Stage Presence", score: 74 },
  ],
  timeline: [
    {
      date: "2026-04-12T00:00:00Z",
      asset_id: "demo-1",
      asset_title: "Hamlet — To be or not to be",
      scores: [
        { dimension: "Diction", score: 88 },
        { dimension: "Memorization", score: 92 },
        { dimension: "Stage Presence", score: 76 },
        { dimension: "Confidence", score: 80 },
        { dimension: "Improvisation", score: 65 },
      ],
      note: "Excellent projection. Work on pacing in the second half.",
    },
    {
      date: "2026-04-05T00:00:00Z",
      asset_id: "demo-2",
      asset_title: "The Glass Menagerie — Tom's monologue",
      scores: [
        { dimension: "Diction", score: 82 },
        { dimension: "Memorization", score: 88 },
        { dimension: "Stage Presence", score: 72 },
        { dimension: "Confidence", score: 76 },
        { dimension: "Improvisation", score: 60 },
      ],
      note: "Good emotional range. Confidence improving steadily.",
    },
  ],
};

export default async function ProgressPage() {
  const { user, token } = await requireSession();

  let report: ProgressReport;
  try {
    report = await api<ProgressReport>(`/students/${user.id}/progress`, { token });
  } catch {
    report = FALLBACK_REPORT;
  }

  const radarDimensions = report.averages.map((a) => ({
    name: a.dimension,
    score: a.score,
  }));

  return (
    <main className="min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-8 py-6">
        <Link href="/home" className="serif text-xl font-black">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-[#C9C9D1]">
          <Link href="/home">Home</Link>
          <a>Channel</a>
          <Link href="/progress" className="text-white">Progress</Link>
          <a>Library</a>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-8 pt-6 pb-4">
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">PERFORMANCE</div>
        <h2 className="serif text-4xl font-black">
          Your <em className="text-[#E8C872] not-italic">Progress</em>
        </h2>
        <p className="text-[#8A8A96] mt-2">
          Rubric scores across all assessed performances.
        </p>
      </section>

      {/* Radar Chart Section */}
      <section className="max-w-6xl mx-auto px-8 py-6">
        <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-8 flex flex-col items-center">
          <h3 className="serif text-lg font-bold mb-6 self-start">Skill Radar</h3>
          <RadarChart dimensions={radarDimensions} size={340} />
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            {report.averages.map((a) => (
              <div key={a.dimension} className="text-center">
                <div className="text-[#E8C872] serif text-lg font-bold">{a.score}</div>
                <div className="text-[#8A8A96] text-xs">{a.dimension}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="serif text-lg font-bold">Assessment Timeline</h3>
          <button
            className="text-xs tracking-widest text-[#8A8A96] border border-[#2A2A36] rounded-lg px-4 py-2 hover:border-[#E8C872]/40 transition-colors"
            onClick={undefined}
          >
            {/* TODO: implement PDF download */}
            DOWNLOAD PDF
          </button>
        </div>
        <div className="space-y-4">
          {report.timeline.map((assess) => (
            <div
              key={assess.asset_id}
              className="bg-[#15151C] border border-[#2A2A36] rounded-xl p-6 hover:border-[#E8C872]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="serif text-lg font-bold">{assess.asset_title}</div>
                  <div className="text-xs text-[#8A8A96] mt-1">
                    {new Date(assess.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
              {/* Score bars */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                {assess.scores.map((s) => (
                  <div key={s.dimension}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#8A8A96]">{s.dimension}</span>
                      <span className="text-[#E8C872]">{s.score}</span>
                    </div>
                    <div className="h-1.5 bg-[#2A2A36] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#E8C872]"
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {assess.note && (
                <div className="mt-3 pt-3 border-t border-[#2A2A36]">
                  <div className="text-[10px] tracking-[0.2em] text-[#8B5CF6] mb-1">INSTRUCTOR NOTE</div>
                  <p className="text-sm text-[#B0B0BA] italic">&ldquo;{assess.note}&rdquo;</p>
                </div>
              )}
            </div>
          ))}
          {report.timeline.length === 0 && (
            <div className="bg-[#15151C] border border-[#2A2A36] rounded-xl p-8 text-center">
              <p className="text-[#8A8A96]">No assessments yet. Your instructor will score your performances here.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
