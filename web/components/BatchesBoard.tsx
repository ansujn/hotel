"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { moveStudentAction } from "@/app/(admin)/batches/actions";

export interface BatchStudent {
  id: string;
  name: string;
  initials: string;
  gradient: string;
}

export interface Batch {
  id: string;
  title: string;
  schedule: string;
  students: BatchStudent[];
}

interface Props {
  batches: Batch[];
}

interface DragState {
  studentId: string;
  fromBatchId: string;
}

export function BatchesBoard({ batches: initial }: Props) {
  const [batches, setBatches] = useState<Batch[]>(initial);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverCol, setHoverCol] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const batchOptions = useMemo(
    () => batches.map((b) => ({ id: b.id, title: b.title })),
    [batches],
  );

  const moveStudent = useCallback(
    (studentId: string, fromBatchId: string, toBatchId: string) => {
      if (fromBatchId === toBatchId) return;
      setBatches((prev) => {
        const fromCol = prev.find((b) => b.id === fromBatchId);
        const student = fromCol?.students.find((s) => s.id === studentId);
        if (!fromCol || !student) return prev;
        return prev.map((b) => {
          if (b.id === fromBatchId) {
            return { ...b, students: b.students.filter((s) => s.id !== studentId) };
          }
          if (b.id === toBatchId) {
            return { ...b, students: [...b.students, student] };
          }
          return b;
        });
      });
      startTransition(async () => {
        await moveStudentAction(studentId, fromBatchId, toBatchId);
      });
    },
    [],
  );

  return (
    <div
      className="grid gap-5 grid-cols-1 md:grid-cols-3"
      aria-busy={isPending}
    >
      {batches.map((batch) => {
        const isHover = hoverCol === batch.id;
        return (
          <section
            key={batch.id}
            aria-label={`${batch.title} batch, ${batch.students.length} students`}
            onDragOver={(e) => {
              e.preventDefault();
              if (drag) setHoverCol(batch.id);
            }}
            onDragLeave={() => {
              if (hoverCol === batch.id) setHoverCol(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setHoverCol(null);
              if (!drag) return;
              moveStudent(drag.studentId, drag.fromBatchId, batch.id);
              setDrag(null);
            }}
            className={`bg-[#15151C] border rounded-2xl p-5 transition-colors ${
              isHover
                ? "border-[#E8C872] bg-[#1C1C26]"
                : "border-[#2A2A36]"
            }`}
          >
            <header className="flex items-baseline justify-between mb-1">
              <h2 className="serif text-lg font-bold text-white">
                {batch.title}
              </h2>
              <span
                className="text-[#E8C872] text-sm font-mono"
                aria-label={`${batch.students.length} students`}
              >
                {batch.students.length}
              </span>
            </header>
            <p className="text-xs text-[#8A8A96] mb-4">{batch.schedule}</p>

            <ul className="space-y-2">
              {batch.students.map((s) => (
                <li key={s.id}>
                  <article
                    draggable
                    onDragStart={() =>
                      setDrag({ studentId: s.id, fromBatchId: batch.id })
                    }
                    onDragEnd={() => {
                      setDrag(null);
                      setHoverCol(null);
                    }}
                    className="group bg-[#0B0B0F] border border-[#2A2A36] rounded-xl p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-[#E8C872]/40"
                  >
                    <div
                      aria-hidden
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${s.gradient} grid place-items-center text-black text-xs font-bold`}
                    >
                      {s.initials}
                    </div>
                    <div className="flex-1 text-sm text-white truncate">
                      {s.name}
                    </div>
                    <label className="sr-only" htmlFor={`move-${s.id}`}>
                      Move {s.name} to another batch
                    </label>
                    <select
                      id={`move-${s.id}`}
                      value={batch.id}
                      onChange={(e) =>
                        moveStudent(s.id, batch.id, e.target.value)
                      }
                      className="text-xs bg-[#15151C] border border-[#2A2A36] rounded px-2 py-1 min-h-[44px] md:min-h-0 text-[#C9C9D1] focus:outline-none focus:border-[#E8C872]/70"
                    >
                      {batchOptions.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  </article>
                </li>
              ))}
              {batch.students.length === 0 && (
                <li className="text-xs text-[#8A8A96] italic text-center py-6 border border-dashed border-[#2A2A36] rounded-xl">
                  Drop a student here
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
