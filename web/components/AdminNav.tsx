import Link from "next/link";
import type { User } from "@/lib/api";
import { NotificationBell } from "@/components/NotificationBell";

const TABS = [
  { href: "/students", label: "Students" },
  { href: "/batches", label: "Batches" },
  { href: "/upload", label: "Upload" },
  { href: "/social", label: "Social Hub" },
  { href: "/clips", label: "Auto-Clip" },
] as const;

export function AdminNav({ user, active }: { user: User; active?: string }) {
  const initials =
    user.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "VK";

  return (
    <header className="border-b border-[#2A2A36] bg-[#0B0B0F]/90 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center gap-8 px-8 py-4">
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
                href={t.href}
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
          <div className="text-right text-xs hidden md:block">
            <div className="text-white font-medium">{user.name ?? "Admin"}</div>
            <div className="text-[#8A8A96] capitalize">{user.role}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#E8C872] grid place-items-center text-black text-xs font-bold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
