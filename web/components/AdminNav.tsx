import Link from "next/link";
import type { Route } from "next";
import type { User } from "@/lib/api";
import { NotificationBell } from "@/components/NotificationBell";
import { UserMenu } from "@/components/UserMenu";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";

const TABS = [
  { href: "/students", label: "Students" },
  { href: "/batches", label: "Batches" },
  { href: "/upload", label: "Upload" },
  { href: "/social", label: "Social Hub" },
  { href: "/clips", label: "Auto-Clip" },
  { href: "/users/new", label: "+ User" },
] as const;

export function AdminNav({ user, active }: { user: User; active?: string }) {
  return (
    <header className="border-b border-[#2A2A36] bg-[#0B0B0F]/90 backdrop-blur sticky top-0 z-20">
      {/* Desktop bar — unchanged */}
      <div className="hidden md:flex max-w-7xl mx-auto items-center gap-8 px-8 py-4">
        <Link href="/home" className="serif text-xl font-black shrink-0">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <span className="text-[10px] tracking-[0.35em] text-[#E8C872] border border-[#E8C872]/40 px-2 py-0.5 rounded">
          ADMIN
        </span>
        <nav className="flex-1 flex gap-1">
          {TABS.map((t) => {
            const isActive = active === t.href;
            return (
              <Link
                key={t.href}
                href={t.href as Route}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#15151C] text-white border border-[#2A2A36]"
                    : "text-[#8A8A96] hover:text-white hover:bg-[#15151C]/60"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          {/* TODO: replace 0 with real unread count from API */}
          <NotificationBell unreadCount={2} />
          <UserMenu user={user} />
        </div>
      </div>

      {/* Mobile bar */}
      <div className="md:hidden flex items-center justify-between gap-2 px-4 py-3">
        <Link
          href="/home"
          className="serif text-lg font-black shrink-0 truncate"
          aria-label="Vik Theatre home"
        >
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <span className="text-[9px] tracking-[0.3em] text-[#E8C872] border border-[#E8C872]/40 px-1.5 py-0.5 rounded shrink-0">
          ADMIN
        </span>
        <div className="flex-1" />
        <NotificationBell unreadCount={2} className="w-11 h-11" />
        <MobileNavDrawer tabs={TABS} activeHref={active} user={user} />
      </div>
    </header>
  );
}
