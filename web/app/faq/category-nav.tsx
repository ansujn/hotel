"use client";

import { useEffect, useRef, useState } from "react";

export interface CategoryItem {
  id: string;
  label: string;
}

interface CategoryNavProps {
  categories: CategoryItem[];
}

/**
 * Sticky horizontal chip strip. Highlights the currently-visible section
 * via IntersectionObserver and smooth-scrolls on click (respects reduced-motion).
 */
export function CategoryNav({ categories }: CategoryNavProps) {
  const [active, setActive] = useState<string>(categories[0]?.id ?? "");
  const stripRef = useRef<HTMLDivElement | null>(null);

  // Observe sections
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sections = categories
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => !!el);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting section.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      {
        // Trigger when section is roughly in the upper-third of the viewport.
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  // Keep active chip in view on horizontal strip
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const chip = strip.querySelector<HTMLAnchorElement>(`a[data-id="${active}"]`);
    if (!chip) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    chip.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    // Update hash without a history jump
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-[#2A2A36] bg-[#0B0B0F]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[#0B0B0F]/70 md:mx-0">
      <div
        ref={stripRef}
        className="flex items-center gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] md:justify-center md:px-6 [&::-webkit-scrollbar]:hidden"
        aria-label="FAQ categories"
      >
        {categories.map((c) => {
          const isActive = active === c.id;
          return (
            <a
              key={c.id}
              data-id={c.id}
              href={`#${c.id}`}
              onClick={(e) => onClick(e, c.id)}
              aria-current={isActive ? "true" : undefined}
              className={[
                "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs tracking-wide transition-colors md:text-sm",
                isActive
                  ? "border-[#E8C872]/70 bg-[#E8C872]/10 text-[#E8C872]"
                  : "border-[#2A2A36] bg-transparent text-[#C9C9D1] hover:border-[#3A3A48] hover:text-white",
              ].join(" ")}
            >
              {c.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
