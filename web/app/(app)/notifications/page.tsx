import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { api, type AppNotification } from "@/lib/api";
import { NotificationsList } from "@/components/NotificationsList";

export default async function NotificationsPage() {
  const { token } = await requireSession();

  let items: AppNotification[] = [];
  try {
    items = await api<AppNotification[]>("/notifications", { token });
  } catch {
    items = [];
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-2">
            Inbox
          </div>
          <h1 className="serif text-3xl md:text-4xl font-black">Notifications</h1>
        </div>
        <Link
          href="/home"
          className="text-xs tracking-[0.2em] uppercase text-[#8A8A96] hover:text-white"
        >
          ← Back
        </Link>
      </header>

      <NotificationsList initial={items} />
    </main>
  );
}
