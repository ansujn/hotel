"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import {
  CUISINE_OPTIONS,
  PRICE_BUCKETS,
  type RestaurantFilters,
} from "@/lib/restaurants-api";

interface Props {
  filters: RestaurantFilters;
  onChange: (next: RestaurantFilters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const [advanced, setAdvanced] = useState(false);

  const set = <K extends keyof RestaurantFilters>(
    k: K,
    v: RestaurantFilters[K] | undefined,
  ) => {
    const next = { ...filters };
    if (v === undefined || v === "" || v === null) delete next[k];
    else next[k] = v;
    onChange(next);
  };

  const clear = () => onChange({});

  const hasActive =
    !!filters.cuisine ||
    !!filters.location ||
    typeof filters.min_price === "number" ||
    typeof filters.max_price === "number" ||
    typeof filters.rating_min === "number" ||
    !!filters.q;

  const activePriceLabel =
    PRICE_BUCKETS.find(
      (b) => b.min === filters.min_price && b.max === filters.max_price,
    )?.label ?? "Any price";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex flex-1 items-center">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by name, cuisine, neighbourhood…"
            value={filters.q ?? ""}
            onChange={(e) => set("q", e.target.value || undefined)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </label>
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          aria-expanded={advanced}
        >
          <SlidersHorizontal size={14} aria-hidden /> Filters
        </button>
        {hasActive ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
          >
            <X size={14} aria-hidden /> Clear
          </button>
        ) : null}
      </div>

      {advanced ? (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Cuisine"
            value={filters.cuisine ?? ""}
            onChange={(v) => set("cuisine", v || undefined)}
            options={[
              { value: "", label: "Any cuisine" },
              ...CUISINE_OPTIONS.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            label="Location"
            value={filters.location ?? ""}
            onChange={(v) => set("location", v || undefined)}
            options={[
              { value: "", label: "Any city" },
              { value: "Mumbai", label: "Mumbai" },
              { value: "New Delhi", label: "New Delhi" },
              { value: "Bengaluru", label: "Bengaluru" },
            ]}
          />
          <Select
            label="Price"
            value={activePriceLabel}
            onChange={(v) => {
              const b = PRICE_BUCKETS.find((x) => x.label === v);
              onChange({
                ...filters,
                min_price: b?.min,
                max_price: b?.max,
              });
            }}
            options={PRICE_BUCKETS.map((b) => ({ value: b.label, label: b.label }))}
          />
          <Select
            label="Min rating"
            value={filters.rating_min ? String(filters.rating_min) : ""}
            onChange={(v) =>
              set("rating_min", v ? Number(v) : undefined)
            }
            options={[
              { value: "", label: "Any rating" },
              { value: "4", label: "4★ & up" },
              { value: "4.5", label: "4.5★ & up" },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
      >
        {options.map((o) => (
          <option key={o.value || "__any"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
