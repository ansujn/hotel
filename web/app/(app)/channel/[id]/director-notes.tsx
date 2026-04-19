import type { Note } from "@/lib/api";

interface Props {
  notes: { note: Note; assetTitle?: string }[];
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  return `${mo}mo ago`;
}

export function DirectorNotes({ notes }: Props) {
  return (
    <aside
      aria-labelledby="director-notes-title"
      className="sticky top-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="h-[1px] w-6 bg-[#E8C872]" />
        <h3
          id="director-notes-title"
          className="text-[10px] tracking-[0.4em] text-[#E8C872] uppercase"
        >
          Director&rsquo;s Notes
        </h3>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-[#2A2A36] bg-[#15151C] p-5">
          <p className="text-sm text-[#8A8A96] italic leading-relaxed">
            No notes yet — instructor feedback will appear here like handwritten
            annotations on your script.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.slice(0, 5).map((n, i) => (
            <NoteCard key={n.note.id} entry={n} index={i} />
          ))}
        </div>
      )}
    </aside>
  );
}

function NoteCard({
  entry,
  index,
}: {
  entry: { note: Note; assetTitle?: string };
  index: number;
}) {
  const { note, assetTitle } = entry;
  // Alternating slight rotation + ink colour — feels like pinned pages
  const rotations = ["-rotate-[0.6deg]", "rotate-[0.4deg]", "-rotate-[0.3deg]", "rotate-[0.7deg]"];
  const rot = rotations[index % rotations.length];
  const inkClass = index % 2 === 0 ? "text-[#E8C872]" : "text-[#B89BFB]";

  return (
    <article
      className={`relative ${rot} transition-transform hover:rotate-0`}
      style={{
        background:
          "linear-gradient(180deg, #faf2e3 0%, #f3e6c8 100%)",
        color: "#2a2318",
        borderRadius: "6px",
        boxShadow:
          "0 10px 30px -12px rgba(0,0,0,0.6), inset 0 0 40px rgba(120,80,20,0.08)",
      }}
    >
      {/* Paper texture */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[6px] opacity-40 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(rgba(120,80,20,0.15) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      {/* Tape-like pin */}
      <div
        aria-hidden
        className={`absolute -top-2 left-5 h-4 w-10 ${inkClass.replace("text-", "bg-")} opacity-70 rounded-[2px]`}
        style={{
          transform: "rotate(-4deg)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      />
      <div className="relative p-5 pt-6">
        {assetTitle && (
          <div className="text-[9px] tracking-[0.3em] uppercase text-[#7a5a15] mb-2">
            on &ldquo;{assetTitle}&rdquo;
          </div>
        )}
        <p
          className="serif text-[15px] leading-relaxed"
          style={{ fontStyle: "italic" }}
        >
          &ldquo;{note.body}&rdquo;
        </p>
        <div className="mt-3 flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-[#7a5a15]">
          <span>— Instructor</span>
          <span>{timeAgo(note.created_at)}</span>
        </div>
      </div>
    </article>
  );
}
