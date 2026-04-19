"use client";

import { useState, type ReactNode } from "react";
import { AccordionRow } from "./accordion";

export interface QA {
  q: string;
  a: ReactNode;
}

interface SectionAccordionProps {
  /** Stable key per section so state is scoped. */
  sectionId: string;
  items: QA[];
}

/**
 * Wraps a list of Q&As and enforces single-open-at-a-time within the section.
 */
export function SectionAccordion({ sectionId, items }: SectionAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2A2A36] bg-[#0F0F15]/60">
      {items.map((item, idx) => (
        <AccordionRow
          key={`${sectionId}-${idx}`}
          question={item.q}
          openOverride={openIdx === idx}
          onToggle={(next) => setOpenIdx(next ? idx : null)}
        >
          {item.a}
        </AccordionRow>
      ))}
    </div>
  );
}
