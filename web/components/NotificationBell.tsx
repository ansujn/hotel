import Link from "next/link";

interface Props {
  unreadCount?: number;
  className?: string;
}

// Server component; safe to embed anywhere. If unreadCount is provided and > 0
// we render a small gold dot indicator in the top-right corner of the bell.
// TODO: fetch unread count from `GET /v1/notifications/unread-count` when it
// exists; for now callers can pass a stub value or omit.
export function NotificationBell({ unreadCount = 0, className = "" }: Props) {
  const hasUnread = unreadCount > 0;
  return (
    <Link
      href="/notifications"
      aria-label={
        hasUnread
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#2A2A36] bg-[#15151C] text-[#C9C9D1] hover:text-white hover:border-[#E8C872]/50 transition-colors ${className}`}
    >
      <span aria-hidden className="text-sm">🔔</span>
      {hasUnread && (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E8C872] ring-2 ring-[#0B0B0F]"
        />
      )}
    </Link>
  );
}
