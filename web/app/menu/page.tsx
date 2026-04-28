import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MENU } from "@/lib/kibana";
import { MenuFlipCard } from "@/components/kibana/MenuFlipCard";
import { Ornament } from "@/components/kibana/Ornament";
import { RevealOnScroll } from "@/components/kibana/RevealOnScroll";

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
        {/* Hero */}
        <section className="kib-burgundy py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="flex justify-center"><Ornament /></div>
            <p className="kib-gold-text mt-6 font-display text-[11px] uppercase tracking-[0.5em]">
              The Menu
            </p>
            <h1 className="mt-4 font-display text-5xl font-light leading-tight text-amber-50 sm:text-7xl">
              Slow cooking. <span className="kib-shimmer italic">Sharper finishes.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-amber-50/70">
              Our menu changes a little with the season. Allergens? Just ask —
              every dish can be tweaked. Hover or tap a card to read the chef's
              note.
            </p>
            <nav className="mt-10 flex flex-wrap justify-center gap-2">
              {MENU.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-50/85 transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  {c.title}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Categories with classical chapter styling */}
        {MENU.map((cat, idx) => (
          <section
            key={cat.id}
            id={cat.id}
            className={`${idx % 2 === 0 ? "kib-paper kib-pattern-damask" : "bg-white"} py-28`}
          >
            <div className="mx-auto max-w-7xl px-6">
              <RevealOnScroll>
                <div className="kib-chapter mb-8">
                  <div className="kib-chapter-number">{String(idx + 1).padStart(2, '0')}</div>
                  <h2 className="kib-chapter-title">
                    {cat.title}
                  </h2>
                  <p className="kib-chapter-subtitle">{cat.blurb}</p>
                  <div className="mt-6 flex justify-center"><Ornament tone="gold" /></div>
                </div>
              </RevealOnScroll>

              <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {cat.items.map((it, i) => (
                  <li key={it.name}>
                    <MenuFlipCard
                      name={it.name}
                      description={it.description}
                      price={it.price}
                      veg={it.veg}
                      signature={it.signature}
                      spice={it.spice}
                      category={cat.title}
                      index={i}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section className="kib-burgundy py-14">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 sm:flex-row sm:items-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-50/70">
              Prices in INR · GST extra · Subject to availability
            </p>
            <a
              href="/book"
              className="kib-btn-gold rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Reserve a Table →
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
