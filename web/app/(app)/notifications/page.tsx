import Link from "next/link";
import { requireSession } from "@/lib/auth";
import {
  NotificationsList,
  type Notification,
} from "@/components/NotificationsList";

// TODO: replace with `GET /v1/notifications` once the endpoint exists.
const STUB_NOTIFS: Notification[] = [
  {
    id: "n1",
    tier: "gold",
    icon: "✉️",
    title: "Consent pending: Diction Drill #4",
    body: "Your parent hasn't approved this for public sharing yet.",
    time: "2h",
    read: false,
  },
  {
    id: "n2",
    tier: "green",
    icon: "🎬",
    title: "New upload on your channel",
    body: "\"Hamlet · Act III, Scene I\" is now live.",
    time: "5h",
    read: false,
  },
  {
    id: "n3",
    tier: "purple",
    icon: "💬",
    title: "Vik left feedback on \"Intro Piece\"",
    body: "Watch pacing at line 47 — beat-work exercise before next take.",
    time: "1d",
    read: false,
  },
  {
    id: "n4",
    tier: "blue",
    icon: "📅",
    title: "Class reminder: Thursday 6:30 PM",
    body: "Showcase rehearsal for Act III.",
    time: "1d",
    read: true,
  },
  {
    id: "n5",
    tier: "red",
    icon: "💳",
    title: "Fees due on 1 May",
    body: "Invoice ₹4,500 will be generated for May term.",
    time: "3d",
    read: true,
  },
];

export default async function NotificationsPage() {
  await requireSession();

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

      <NotificationsList initial={STUB_NOTIFS} />
    </main>
  );
}
