import Link from "next/link";
import type { Route } from "next";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { KIBANA } from "@/lib/kibana";

export function SiteFooter() {
  return (
    <footer className="bg-[#3B1F1A] text-amber-50/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="font-serif text-lg font-semibold text-amber-50">
            Kibana Jaipur
          </p>
          <p className="mt-2 text-sm text-amber-100/70">{KIBANA.tagline}</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">
            Visit us
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={14} aria-hidden className="mt-0.5 shrink-0 text-amber-200" />
              <a
                href={KIBANA.google_maps}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {KIBANA.address}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} aria-hidden className="shrink-0 text-amber-200" />
              <div className="flex flex-col gap-0.5">
                <a href={`tel:${KIBANA.phone.replace(/\s+/g, "")}`} className="hover:underline">
                  {KIBANA.phone}
                </a>
                <span className="text-xs text-amber-100/60">{KIBANA.contact_person} · {KIBANA.contact_phone}</span>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} aria-hidden className="shrink-0 text-amber-200" />
              <a href={`mailto:${KIBANA.email}`} className="hover:underline">
                {KIBANA.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">
            Hours
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {Object.entries(KIBANA.hours).map(([day, h]) => (
              <li key={day} className="flex justify-between gap-3">
                <span className="text-amber-100/80">{day}</span>
                <span className="text-amber-50">
                  {h ? `${h.open}–${h.close}` : "Closed"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">
            Stay close
          </h3>
          <div className="mt-3 flex gap-3">
            <a
              href={KIBANA.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full bg-amber-50/10 transition hover:bg-amber-50/20"
            >
              <Instagram size={16} />
            </a>
            <a
              href={KIBANA.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid h-10 w-10 place-items-center rounded-full bg-amber-50/10 transition hover:bg-amber-50/20"
            >
              <Facebook size={16} />
            </a>
          </div>
          <Link
            href={"/book" as Route}
            className="mt-5 inline-flex rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-[#3B1F1A] hover:bg-amber-100"
          >
            Book a table
          </Link>
        </div>
      </div>
      <div className="border-t border-amber-50/10 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 text-xs text-amber-100/60 sm:flex-row sm:items-center sm:px-6">
          <p>© {new Date().getFullYear()} Kibana Jaipur · All rights reserved.</p>
          <Link href={"/admin" as Route} className="hover:text-amber-50">
            Owner login
          </Link>
        </div>
      </div>
    </footer>
  );
}
