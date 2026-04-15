import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { LogoutButton } from "../home/logout-button";

const tabs = [
  { href: "/parent", label: "Overview" },
  { href: "/parent/consent", label: "Consent Center" },
  { href: "/parent/fees", label: "Fees" },
  { href: "/parent/messages", label: "Messages" },
];

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSession();
  if (user.role !== "parent") {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-[#F5F5F7]">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-8 py-6">
        <Link href="/parent" className="serif text-xl font-black">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <nav
          aria-label="Parent sections"
          className="hidden md:flex gap-8 text-sm text-[#C9C9D1]"
        >
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="hover:text-white transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </header>
      {children}
    </div>
  );
}
