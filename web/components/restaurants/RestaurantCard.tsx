import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { Star, Video, MapPin } from "lucide-react";
import type { RestaurantCard as RestaurantCardType } from "@/lib/restaurants-api";

export function RestaurantCard({ r }: { r: RestaurantCardType }) {
  return (
    <Link
      href={`/restaurants/${r.id}` as Route}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-slate-300"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {r.hero_image_url ? (
          <Image
            src={r.hero_image_url}
            alt={r.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        {r.video_count > 0 ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            <Video size={12} aria-hidden /> {r.video_count}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-serif text-lg font-semibold text-slate-900">
            {r.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1 text-sm text-amber-600">
            <Star size={14} fill="currentColor" aria-hidden />
            <span className="font-semibold">{r.avg_rating.toFixed(1)}</span>
            <span className="text-slate-400">({r.review_count})</span>
          </div>
        </div>
        <p className="line-clamp-1 text-sm text-slate-500">{r.cuisine.join(" · ")}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} aria-hidden /> {r.location}, {r.city}
          </span>
          <span className="text-sm font-medium text-slate-900">
            ₹{r.avg_price_per_plate}
            <span className="ml-0.5 text-xs font-normal text-slate-400">/plate</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
