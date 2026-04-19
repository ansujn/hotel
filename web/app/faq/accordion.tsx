"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState, type ReactNode } from "react";

interface AccordionRowProps {
  question: string;
  children: ReactNode;
  /** If true, this row owns "opened" state and will auto-close when another opens. */
  openOverride?: boolean;
  onToggle?: (next: boolean) => void;
}

/**
 * A single accordion row: question button on top, animated answer panel below.
 * Honours prefers-reduced-motion (instant open/close, no chevron spin).
 */
export function AccordionRow({
  question,
  children,
  openOverride,
  onToggle,
}: AccordionRowProps) {
  const [internal, setInternal] = useState(false);
  const open = typeof openOverride === "boolean" ? openOverride : internal;
  const reduce = useReducedMotion();
  const panelId = useId();
  const buttonId = useId();

  const toggle = () => {
    const next = !open;
    if (typeof openOverride === "boolean") {
      onToggle?.(next);
    } else {
      setInternal(next);
      onToggle?.(next);
    }
  };

  return (
    <div
      className={[
        "relative border-b border-[#2A2A36] transition-colors",
        open ? "bg-[#111118]" : "bg-transparent",
      ].join(" ")}
    >
      {/* Gold spotlight stripe when open */}
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute left-0 top-0 h-full w-[2px] origin-top transition-all duration-300",
          open ? "bg-[#E8C872] opacity-100 scale-y-100" : "bg-[#E8C872] opacity-0 scale-y-50",
        ].join(" ")}
      />
      <button
        id={buttonId}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-4 px-4 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60 focus-visible:ring-offset-0 md:px-6"
      >
        <span className="serif text-base font-semibold leading-snug text-[#F5F5F7] md:text-lg">
          {question}
        </span>
        <span
          aria-hidden
          className={[
            "mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#2A2A36] text-[#E8C872]",
            reduce ? "" : "transition-transform duration-300",
            open ? "rotate-180 border-[#E8C872]/60" : "rotate-0",
          ].join(" ")}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={reduce ? { height: "auto", opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
            }
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-6 pr-8 text-sm leading-relaxed text-[#C9C9D1] md:px-6 md:text-[15px]">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
