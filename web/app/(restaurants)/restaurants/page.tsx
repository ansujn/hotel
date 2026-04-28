"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import {
  getFeaturedRestaurants,
  listRestaurants,
  type RestaurantFilters,
} from "@/lib/restaurants-api";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { FilterBar } from "@/components/restaurants/FilterBar";

export default function DiscoveryPage() {
  const [filters, setFilters] = useState<RestaurantFilters>({});

  const featured = useQuery({
    queryKey: ["restaurants", "featured"],
    queryFn: () => getFeaturedRestaurants(4),
  });

  const list = useQuery({
    queryKey: ["restaurants", "list", filters],
    queryFn: () => listRestaurants(filters),
  });

  const showFeatured = useMemo(
    () => Object.keys(filters).length === 0,
    [filters],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Hero */}
      <section className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Find your next favourite table.
          </h1>
          <p className="mt-3 max-w-xl text-lg text-slate-600">
            Real videos, honest reviews, and the small details menus never tell
            you. No bookings, no logins — just discovery.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200/70 lg:aspect-[5/4]">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80"
            alt="Restaurant interior"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Filters */}
      <section className="mb-8">
        <FilterBar filters={filters} onChange={setFilters} />
      </section>

      {/* Featured (only when no filters active) */}
      {showFeatured && featured.data && featured.data.length > 0 ? (
        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">
              Featured this week
            </h2>
            <Link
              href={"/restaurants?rating_min=4.5" as Route}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              See top-rated →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.data.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      ) : null}

      {/* List */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            {showFeatured ? "All restaurants" : "Results"}
          </h2>
          {list.data ? (
            <span className="text-sm text-slate-500">
              {list.data.total} match{list.data.total === 1 ? "" : "es"}
            </span>
          ) : null}
        </div>

        {list.isLoading ? (
          <SkeletonGrid />
        ) : list.error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Couldn't load restaurants. Please try again.
          </p>
        ) : list.data && list.data.restaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.data.restaurants.map((r) => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
            No restaurants match those filters. Try clearing one.
          </p>
        )}
      </section>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70"
        >
          <div className="aspect-[4/3] w-full animate-pulse bg-slate-200" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
