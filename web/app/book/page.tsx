import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BookingForm } from "./booking-form";
import { KIBANA, BANQUETS, OCCASIONS } from "@/lib/kibana";
import { Phone, Mail, MapPin } from "lucide-react";

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
        <section className="border-b border-amber-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Book
            </p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold text-[#3B1F1A] sm:text-5xl">
              Reserve a table or plan an event.
            </h1>
            <p className="mt-3 max-w-2xl text-[#3B1F1A]/70">
              Tell us a little about your evening. Our team responds within a
              few hours during business hours.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
            <BookingForm
              banquets={BANQUETS.map((b) => ({ id: b.id, name: b.name }))}
              occasions={OCCASIONS as unknown as string[]}
            />

            <aside className="space-y-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-900/5">
                <h2 className="font-serif text-xl font-semibold text-[#3B1F1A]">
                  Prefer to talk?
                </h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Phone size={14} aria-hidden className="mt-1 text-amber-700" />
                    <div>
                      <p className="font-medium text-[#3B1F1A]">Front desk</p>
                      <a
                        href={`tel:${KIBANA.phone.replace(/\s+/g, "")}`}
                        className="text-[#3B1F1A]/70 hover:underline"
                      >
                        {KIBANA.phone}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone size={14} aria-hidden className="mt-1 text-amber-700" />
                    <div>
                      <p className="font-medium text-[#3B1F1A]">
                        Events (WhatsApp)
                      </p>
                      <a
                        href={`https://wa.me/${KIBANA.whatsapp.replace(/\D+/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#3B1F1A]/70 hover:underline"
                      >
                        {KIBANA.whatsapp}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Mail size={14} aria-hidden className="mt-1 text-amber-700" />
                    <div>
                      <p className="font-medium text-[#3B1F1A]">Email</p>
                      <a
                        href={`mailto:${KIBANA.email}`}
                        className="text-[#3B1F1A]/70 hover:underline"
                      >
                        {KIBANA.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin size={14} aria-hidden className="mt-1 text-amber-700" />
                    <div>
                      <p className="font-medium text-[#3B1F1A]">Find us</p>
                      <a
                        href={KIBANA.google_maps}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#3B1F1A]/70 hover:underline"
                      >
                        {KIBANA.address}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
                <h3 className="font-serif text-lg font-semibold text-[#3B1F1A]">
                  Hosting an event?
                </h3>
                <p className="mt-2 text-sm text-[#3B1F1A]/75">
                  Pick a banquet from the dropdown to get a draft quote with
                  capacity, pricing, and add-ons.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
