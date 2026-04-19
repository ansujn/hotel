import type { ProgressTimelineEntry } from "@/lib/api";

interface DirectorNotesProps {
  entries: ProgressTimelineEntry[];
  emptyCta?: React.ReactNode;
}

/**
 * Recent instructor feedback rendered as slightly-rotated paper cards with
 * a handwritten-note feel. Pure server component, no JS required.
 */
export function DirectorNotes({ entries, emptyCta }: DirectorNotesProps) {
  const withNotes = entries.filter((e) => e.note && e.note.trim().length > 0).slice(0, 3);

  if (withNotes.length === 0) {
    return (
      <EmptyNotes>
        {emptyCta ?? (
          <>
            <div className="serif text-2xl font-black mb-2">
              The director&rsquo;s pen awaits.
            </div>
            <p className="text-[#C9C9D1] text-sm max-w-md">
              Upload a monologue and Victor&rsquo;s first note to you — rehearsal tips,
              what landed, what&rsquo;s next — will live here.
            </p>
          </>
        )}
      </EmptyNotes>
    );
  }

  const rotations = ["-1.2deg", "0.8deg", "-0.4deg"];
  const tapes = ["left-6", "right-6", "left-1/2 -translate-x-1/2"];

  return (
    <div className="grid md:grid-cols-3 gap-5">
      {withNotes.map((entry, i) => (
        <article
          key={entry.asset_id}
          className="relative p-6 pt-9 rounded-sm border border-[#e6dcc3]/10"
          style={{
            transform: `rotate(${rotations[i % rotations.length]})`,
            background:
              "linear-gradient(180deg, #f6ecd2 0%, #ebdfbe 100%)",
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.05) 1px, transparent 1px), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(180deg, #f6ecd2 0%, #ebdfbe 100%)",
            backgroundSize: "24px 24px, 40px 40px, 100% 100%",
            boxShadow:
              "0 14px 30px -12px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.3)",
            color: "#1c1208",
          }}
        >
          {/* Washi tape */}
          <div
            aria-hidden
            className={`absolute -top-2 ${tapes[i % tapes.length]} w-20 h-6`}
            style={{
              background:
                "linear-gradient(180deg, rgba(232,200,114,0.85) 0%, rgba(232,200,114,0.55) 100%)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              transform: "rotate(-3deg)",
            }}
          />

          <div
            className="text-[10px] tracking-[0.35em]"
            style={{ color: "#7a5a1c" }}
          >
            DIRECTOR&rsquo;S NOTE
          </div>
          <div
            className="serif text-lg font-bold mt-1 leading-tight"
            style={{ color: "#1c1208" }}
          >
            {entry.asset_title}
          </div>
          <p
            className="mt-3 text-[15px] leading-relaxed italic"
            style={{
              color: "#2a1d0d",
              fontFamily:
                "'Caveat', 'Fraunces', 'Patrick Hand', ui-serif, Georgia, serif",
            }}
          >
            &ldquo;{entry.note}&rdquo;
          </p>
          <div
            className="mt-4 text-[11px]"
            style={{ color: "#7a5a1c" }}
          >
            {new Date(entry.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        </article>
      ))}
    </div>
  );
}

function EmptyNotes({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#2A2A36] bg-[#15151C]/60 p-8 md:p-10 text-center">
      {children}
    </div>
  );
}
