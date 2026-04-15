"use client";

import { useId } from "react";

interface Props {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export function ScopeToggleRow({
  title,
  hint,
  checked,
  onChange,
  disabled,
}: Props) {
  const hintId = useId();
  return (
    <div className="flex items-start justify-between gap-6 rounded-xl border border-[#2A2A36] bg-[#15151C] p-5">
      <div className="min-w-0 flex-1">
        <div className="serif text-base font-bold text-[#F5F5F7]">{title}</div>
        <p id={hintId} className="mt-1 text-sm text-[#8A8A96]">
          {hint}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        aria-describedby={hintId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60",
          checked
            ? "bg-[#E8C872] border-[#E8C872]"
            : "bg-[#0B0B0F] border-[#2A2A36]",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
