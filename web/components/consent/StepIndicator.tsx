"use client";

import type { ConsentStrings } from "@/lib/consent";

interface Props {
  current: 1 | 2 | 3;
  t: ConsentStrings;
}

export function StepIndicator({ current, t }: Props) {
  const steps: { n: 1 | 2 | 3; label: string }[] = [
    { n: 1, label: t.step1 },
    { n: 2, label: t.step2 },
    { n: 3, label: t.step3 },
  ];

  return (
    <ol
      aria-label="Progress"
      className="flex items-center gap-3 text-xs tracking-widest"
    >
      {steps.map((s, i) => {
        const active = s.n === current;
        const done = s.n < current;
        return (
          <li key={s.n} className="flex items-center gap-3">
            <span
              aria-current={active ? "step" : undefined}
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                done
                  ? "bg-[#E8C872] border-[#E8C872] text-black"
                  : active
                    ? "border-[#E8C872] text-[#E8C872]"
                    : "border-[#2A2A36] text-[#8A8A96]",
              ].join(" ")}
            >
              {done ? "✓" : s.n}
            </span>
            <span
              className={
                active || done ? "text-[#F5F5F7]" : "text-[#8A8A96]"
              }
            >
              {s.label.toUpperCase()}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 h-px w-8 bg-[#2A2A36]" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
