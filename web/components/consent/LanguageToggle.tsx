"use client";

import type { Lang } from "@/lib/consent";

interface Props {
  lang: Lang;
  onChange: (l: Lang) => void;
}

export function LanguageToggle({ lang, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full border border-[#2A2A36] bg-[#15151C] p-1 text-xs"
    >
      {(["en", "hi"] as const).map((opt) => {
        const active = lang === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={[
              "rounded-full px-3 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60",
              active
                ? "bg-[#E8C872] text-black font-semibold"
                : "text-[#C9C9D1] hover:text-white",
            ].join(" ")}
          >
            {opt === "en" ? "EN" : "हिन्दी"}
          </button>
        );
      })}
    </div>
  );
}
