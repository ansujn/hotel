import Link from "next/link";
import type { Metadata, Route } from "next";

export const metadata: Metadata = {
  title: { default: "Tabletop", template: "%s · Tabletop" },
  description:
    "Discover restaurants — videos, photos, real reviews. No bookings, no fluff.",
  openGraph: {
    type: "website",
    title: "Tabletop",
    description:
      "Discover restaurants — videos, photos, real reviews. No bookings, no fluff.",
  },
};

export default function RestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href={"/restaurants" as Route}
            className="font-serif text-xl font-bold tracking-tight text-slate-900"
          >
            Tabletop
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link
              href={"/restaurants" as Route}
              className="text-slate-600 hover:text-slate-900"
            >
              Discover
            </Link>
            <Link
              href={"/restaurants?cuisine=Continental" as Route}
              className="hidden text-slate-600 hover:text-slate-900 sm:inline"
            >
              Continental
            </Link>
            <Link
              href={"/restaurants?cuisine=North%20Indian" as Route}
              className="hidden text-slate-600 hover:text-slate-900 sm:inline"
            >
              North Indian
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-slate-500 sm:px-6">
          © {new Date().getFullYear()} Tabletop · Discovery, not bookings.
        </div>
      </footer>
    </div>
  );
}
