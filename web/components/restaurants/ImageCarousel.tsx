"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RestaurantImage } from "@/lib/restaurants-api";

export function ImageCarousel({ images }: { images: RestaurantImage[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const scrollTo = useCallback((idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      const center = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let bestDist = Infinity;
      children.forEach((c, i) => {
        const cCenter = c.offsetLeft + c.clientWidth / 2;
        const d = Math.abs(cCenter - center);
        if (d < bestDist) {
          bestDist = d;
          nearest = i;
        }
      });
      setActive(nearest);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
        No photos yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-2xl pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img) => (
          <li
            key={img.id}
            className="relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/70 sm:w-[60%] lg:w-[45%]"
          >
            <Image
              src={img.url}
              alt={img.caption ?? "Restaurant photo"}
              fill
              sizes="(max-width: 768px) 85vw, 600px"
              className="object-cover"
            />
            {img.caption ? (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm text-white">
                {img.caption}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => scrollTo(Math.max(0, active - 1))}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-md ring-1 ring-slate-200 backdrop-blur hover:bg-white sm:block"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(Math.min(images.length - 1, active + 1))}
            aria-label="Next image"
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-md ring-1 ring-slate-200 backdrop-blur hover:bg-white sm:block"
          >
            <ChevronRight size={18} />
          </button>
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-slate-900" : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
