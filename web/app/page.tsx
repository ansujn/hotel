import Link from "next/link";
import { Button } from "@/components/Button";

const classes = [
  {
    title: "Monologue Lab",
    age: "Ages 10–14",
    desc: "Solo work. Diction, stage presence, emotional range.",
    fee: "₹4,800/mo",
  },
  {
    title: "Scene Study",
    age: "Ages 13–17",
    desc: "Partner scenes. Listening, reacting, owning the room.",
    fee: "₹5,400/mo",
  },
  {
    title: "Showcase Ensemble",
    age: "Ages 14–18",
    desc: "Term-end public showcase. Full production arc.",
    fee: "₹6,500/mo",
  },
  {
    title: "Little Stage",
    age: "Ages 6–9",
    desc: "Play-based. Storytelling, voice, imagination.",
    fee: "₹3,900/mo",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen grad-hero">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-8 py-6">
        <Link href="/" className="serif text-2xl font-black">
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#C9C9D1]">
          <a href="#classes" className="hover:text-white cursor-pointer">Classes</a>
          <a href="#classes" className="hover:text-white cursor-pointer">Batches</a>
          <Link href="/login" className="hover:text-white cursor-pointer">Students</Link>
          <a href="#about" className="hover:text-white cursor-pointer">About</a>
          <a href="mailto:hello@viktheatre.in" className="hover:text-white cursor-pointer">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="md">Login</Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="md">Book Trial</Button>
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-8 pt-20 pb-24">
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-6">
          VIK THEATRE · EST. 2019
        </div>
        <h1 className="serif text-6xl md:text-7xl font-black leading-[1.02] max-w-4xl">
          Where every voice<br />
          finds its <em className="text-[#E8C872] not-italic">stage</em>.
        </h1>
        <p className="mt-6 text-lg text-[#B0B0BA] max-w-xl">
          Personal coaching, small batches, your own video channel. From stage
          fright to standing ovation.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/login">
            <Button size="lg" variant="primary">Book a Trial Class</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="ghost">Login</Button>
          </Link>
        </div>
      </section>

      <section id="classes" className="max-w-7xl mx-auto px-8 pb-24 scroll-mt-24">
        <h2 className="serif text-4xl font-black text-center mb-12">
          Find your <em className="text-[#E8C872] not-italic">class</em>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {classes.map((c) => (
            <div
              key={c.title}
              className="group bg-[#15151C] border border-[#2A2A36] rounded-2xl p-6 hover:border-[#E8C872]/50 transition-colors"
            >
              <div className="h-28 rounded-xl mb-5 bg-gradient-to-br from-[#8B5CF6]/60 to-[#E8C872]/60" />
              <h4 className="serif text-lg font-bold mb-1">{c.title}</h4>
              <div className="text-xs tracking-widest text-[#8A8A96] uppercase mb-3">
                {c.age}
              </div>
              <p className="text-sm text-[#B0B0BA] mb-4">{c.desc}</p>
              <div className="serif text-xl text-[#E8C872] font-bold">{c.fee}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="max-w-4xl mx-auto px-8 pb-24 scroll-mt-24 text-center">
        <h2 className="serif text-3xl font-black mb-4">
          About <em className="text-[#E8C872] not-italic">Vik Theatre</em>
        </h2>
        <p className="text-[#B0B0BA] leading-relaxed">
          Vik Theatre is a Bangalore-based studio for young performers — classes,
          coaching, and a term-end public showcase. Founded 2019.
        </p>
      </section>

      <footer className="border-t border-[#2A2A36] py-8 text-center text-sm text-[#8A8A96]">
        © {new Date().getFullYear()} Vik Theatre. Crafted in Bangalore.
      </footer>
    </main>
  );
}
