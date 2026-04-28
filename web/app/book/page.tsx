import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BookingForm } from "./booking-form";
import { KIBANA, BANQUETS, OCCASIONS } from "@/lib/kibana";
import { Phone, Mail, MapPin } from "lucide-react";
import { Ornament } from "@/components/kibana/Ornament";
import { RevealOnScroll } from "@/components/kibana/RevealOnScroll";

export const metadata: Metadata = {
  title: "Book",
  description:
    "Reserve a table or enquire about hosting an event at Kibana Jaipur — five banquet halls, full event team.",
};

export default function BookPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="kib-burgundy py-24 sm:py-28">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="flex justify-center"><Ornament /></div>
            <p className="kib-gold-text mt-6 font-display text-[11px] uppercase tracking-[0.5em]">
              Reservations · Events
            </p>
            <h1 className="mt-4 font-display text-5xl font-light leading-tight text-amber-50 sm:text-7xl">
              Reserve a table or <span className="kib-shimmer italic">plan an evening.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-amber-50/75">
              Tell us a little about your evening. Our team responds within a
              few hours during business hours.
            </p>
          </div>
        </section>

        <section className="kib-paper py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.3fr_1fr]">
            <RevealOnScroll>
              <div className="kib-frame bg-white p-2">
                <BookingForm
                  banquets={BANQUETS.map((b) => ({ id: b.id, name: b.name }))}
                  occasions={OCCASIONS as unknown as string[]}
                />
              </div>
            </RevealOnScroll>

            <aside className="space-y-5">
              <RevealOnScroll delay={0.1}>
                <div className="kib-frame bg-gradient-to-br from-[#3B1F1A] to-[#2A1411] p-8 text-amber-50">
                  <Ornament />
                  <h2 className="mt-4 font-display text-2xl">Prefer to talk?</h2>
                  <ul className="mt-6 space-y-4 text-sm">
                    <ContactRow
                      icon={<Phone size={14} aria-hidden />}
                      label="Front desk"
                      value={KIBANA.phone}
                      href={`tel:${KIBANA.phone.replace(/\s+/g, "")}`}
                    />
                    <ContactRow
                      icon={<Phone size={14} aria-hidden />}
                      label="Events (WhatsApp)"
                      value={KIBANA.whatsapp}
                      href={`https://wa.me/${KIBANA.whatsapp.replace(/\D+/g, "")}`}
                      external
                    />
                    <ContactRow
                      icon={<Mail size={14} aria-hidden />}
                      label="Email"
                      value={KIBANA.email}
                      href={`mailto:${KIBANA.email}`}
                    />
                    <ContactRow
                      icon={<MapPin size={14} aria-hidden />}
                      label="Find us"
                      value={KIBANA.address}
                      href={KIBANA.google_maps}
                      external
                    />
                  </ul>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={0.18}>
                <div className="kib-frame bg-gradient-to-br from-[#FBF8F1] to-[#F3EBD7] p-8">
                  <p className="kib-gold-text font-display text-[10px] uppercase tracking-[0.5em]">
                    Hosting an event?
                  </p>
                  <h3 className="mt-4 font-display text-2xl text-[#3B1F1A]">
                    Pick a banquet
                  </h3>
                  <p className="mt-3 text-sm text-[#3B1F1A]/75">
                    Choose a hall in the dropdown to receive a draft quote with
                    capacity, pricing, and add-ons.
                  </p>
                </div>
              </RevealOnScroll>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 text-[#D4AF37]">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-50/55">
          {label}
        </p>
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="mt-1 block text-amber-50/95 hover:text-[#D4AF37]"
        >
          {value}
        </a>
      </div>
    </li>
  );
}
