import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationBell";
import { LogoutButton } from "./logout-button";

const announcements = [
  { tag: "SHOWCASE", title: "Spring showcase auditions open", when: "Apr 20 · Black Box" },
  { tag: "BATCH", title: "New Scene Study batch — Mondays 5pm", when: "Starts Apr 28" },
  { tag: "NOTE", title: "Bring script for ‘The Glass Menagerie’", when: "This Saturday" },
];

const progress = 72;

export default async function HomePage() {
  const { user } = await requireSession();

  // Role-aware post-login routing. The /home route is the canonical landing
  // after login; parents and staff should be kicked to their own dashboards.
  if (user.role === "parent") redirect("/parent");
  if (user.role === "admin" || user.role === "instructor") {
    redirect("/students");
  }
  // Students (and any other roles) stay on this dashboard.

  const firstName = user.name?.split(" ")[0] ?? "friend";

  return (
    <main className="min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-8 py-6">
        <Link href="/" className="serif text-xl font-black">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-[#C9C9D1]">
          <Link href="/home" className="text-white">Home</Link>
          <Link href={`/channel/${user.id}`} className="hover:text-white">Channel</Link>
          <Link href="/progress" className="hover:text-white">Progress</Link>
          <Link href="/notifications" className="hover:text-white">Inbox</Link>
        </nav>
        <div className="flex items-center gap-3">
          {/* TODO: replace 0 with real unread count from API */}
          <NotificationBell unreadCount={3} />
          <LogoutButton />
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-8 pt-6 pb-10">
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">WELCOME</div>
        <h2 className="serif text-4xl font-black">
          Hello, <em className="text-[#E8C872] not-italic">{firstName}</em>.
        </h2>
        <p className="text-[#8A8A96] mt-2">Here&rsquo;s your week on stage.</p>
      </section>

      <section className="max-w-6xl mx-auto px-8 grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-[#15151C] border border-[#2A2A36] rounded-2xl p-7">
          <div className="flex items-center justify-between mb-4">
            <h4 className="serif text-base font-bold">Next class</h4>
            <span className="text-xs tracking-widest text-[#8A8A96]">SCENE STUDY</span>
          </div>
          <div className="serif text-2xl text-[#E8C872] font-bold">
            Sat · 10:30 AM
          </div>
          <p className="mt-2 text-[#B0B0BA]">
            Partner scene from <em>The Glass Menagerie</em>. Bring a printed script.
          </p>
          <div className="mt-5 h-40 rounded-xl bg-gradient-to-br from-[#8B5CF6]/50 via-transparent to-[#E8C872]/40 border border-[#2A2A36] flex items-end p-5">
            <div>
              <div className="text-xs tracking-widest text-[#E8C872]">NOW PLAYING</div>
              <div className="serif text-lg font-bold">Your last monologue</div>
            </div>
          </div>
        </div>

        <div className="bg-[#15151C] border border-[#2A2A36] rounded-2xl p-7 flex flex-col items-center text-center">
          <h4 className="serif text-base font-bold self-start mb-4">Term progress</h4>
          <div
            className="ring-gradient w-40 h-40 rounded-full flex items-center justify-center"
            style={{ ["--p" as string]: `${progress}%` }}
          >
            <div className="w-32 h-32 rounded-full bg-[#15151C] flex items-center justify-center">
              <span className="serif text-4xl font-bold text-[#E8C872]">{progress}%</span>
            </div>
          </div>
          <p className="text-xs text-[#8A8A96] mt-4">
            Diction +5 · Confidence +3<br />since last month
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="serif text-base font-bold">Announcements</h4>
          <Link href="/notifications" className="text-xs tracking-widest text-[#8A8A96] hover:text-[#E8C872]">VIEW ALL →</Link>
        </div>
        <div className="space-y-3">
          {announcements.map((a) => (
            <Link
              key={a.title}
              href="/notifications"
              className="block bg-[#15151C] border border-[#2A2A36] rounded-xl p-5 flex items-center justify-between hover:border-[#E8C872]/40 transition-colors"
            >
              <div>
                <div className="text-[10px] tracking-[0.3em] text-[#E8C872] mb-1">{a.tag}</div>
                <div className="serif text-lg font-bold">{a.title}</div>
              </div>
              <div className="text-sm text-[#8A8A96]">{a.when}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
