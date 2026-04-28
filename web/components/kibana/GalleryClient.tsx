"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface KibanaImage {
  id: string;
  url: string;
  type: string;
  caption?: string;
  position?: number;
}

const TABS = [
  { id: "all", label: "All" },
  { id: "interior", label: "Interior" },
  { id: "dish", label: "Food" },
  { id: "event", label: "Events" },
  { id: "hero", label: "Rooftop" },
];

export function GalleryClient({ images }: { images: KibanaImage[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedImage, setSelectedImage] = useState<KibanaImage | null>(null);

  const filteredImages =
    activeTab === "all"
      ? images
      : images.filter((img) => img.type === activeTab);

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2 text-xs mb-10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`rounded-full px-4 py-2 font-semibold uppercase tracking-[0.2em] transition ${
              activeTab === t.id
                ? "border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                : "border border-[#D4AF37]/40 text-[#3B1F1A]/80 hover:border-[#D4AF37]/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filteredImages.map((img, i) => (
          <li
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className={`kib-frame relative bg-amber-100 cursor-pointer group ${
              i % 5 === 0 ? "row-span-2 sm:col-span-2" : ""
            }`}
            style={{
              aspectRatio: i % 5 === 0 ? "1 / 1" : "4 / 5",
            }}
          >
            <Image
              src={img.url}
              alt={img.caption ?? "Kibana Jaipur"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-700 group-hover:scale-110"
            />
            {img.caption ? (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1A0F0D]/95 via-[#1A0F0D]/60 to-transparent p-4 text-xs uppercase tracking-[0.2em] text-amber-50">
                {img.caption}
              </span>
            ) : null}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition rounded flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white font-semibold text-sm transition">
                View
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-amber-300 transition"
              aria-label="Close"
            >
              <X size={32} />
            </button>
            <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
              <Image
                src={selectedImage.url}
                alt={selectedImage.caption ?? "Kibana Jaipur"}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            {selectedImage.caption && (
              <p className="text-amber-50 text-center mt-4 text-sm uppercase tracking-[0.2em]">
                {selectedImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
