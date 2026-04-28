import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MENU } from "@/lib/kibana";
import { Leaf, Flame, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Modern Indian and global plates served on Kibana Jaipur's rooftop. From small plates to lobster thermidor.",
};

export default function MenuPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-amber-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              The Menu
            </p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold text-[#3B1F1A] sm:text-5xl">
              Slow cooking. Sharper finishes.
            </h1>
            <p className="mt-3 max-w-2xl text-[#3B1F1A]/70">
              Our menu changes a little with the season. Allergens? Just ask —
              every dish can be tweaked.
            </p>
            <nav className="mt-6 flex flex-wrap gap-2">
              {MENU.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-[#3B1F1A] hover:bg-amber-100"
                >
                  {c.title}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {MENU.map((cat) => (
          <section
            key={cat.id}
            id={cat.id}
            className="border-b border-amber-100/60 py-14"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <header className="mb-8 max-w-2xl">
                <h2 className="font-serif text-3xl font-bold text-[#3B1F1A] sm:text-4xl">
                  {cat.title}
                </h2>
                <p className="mt-2 text-[#3B1F1A]/70">{cat.blurb}</p>
              </header>
              <ul className="grid gap-x-10 gap-y-7 md:grid-cols-2">
                {cat.items.map((it) => (
                  <li
                    key={it.name}
                    className="flex items-start justify-between gap-6 border-b border-dashed border-amber-200/70 pb-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-semibold text-[#3B1F1A]">
                          {it.name}
                        </h3>
                        {it.signature ? (
                          <span
                            title="Signature dish"
                            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
                          >
                            <Award size={10} aria-hidden /> Signature
                          </span>
                        ) : null}
                        {it.veg ? (
                          <span
                            title="Vegetarian"
                            className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-emerald-600 text-emerald-700"
                            aria-label="Vegetarian"
                          >
                            <Leaf size={10} aria-hidden />
                          </span>
                        ) : null}
                        {it.spice ? (
                          <span
                            className="inline-flex items-center text-rose-600"
                            aria-label={`Spice level ${it.spice}`}
                          >
                            {Array.from({ length: it.spice }).map((_, i) => (
                              <Flame key={i} size={10} aria-hidden />
                            ))}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[#3B1F1A]/70">
                        {it.description}
                      </p>
                    </div>
                    <p className="shrink-0 font-serif text-lg font-semibold text-[#3B1F1A]">
                      ₹{it.price}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section className="bg-amber-50 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 sm:flex-row sm:items-center sm:px-6">
            <p className="text-sm text-[#3B1F1A]/70">
              Prices in INR. GST extra. Subject to availability.
            </p>
            <a
              href="/book"
              className="rounded-full bg-[#3B1F1A] px-5 py-2.5 text-sm font-semibold text-amber-50 hover:bg-[#4d2823]"
            >
              Reserve a table →
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
