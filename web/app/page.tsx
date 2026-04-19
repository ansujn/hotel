import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { StageNav } from "./_marketing/stage-nav";
import { SpotlightCursor } from "./_marketing/spotlight-cursor";
import { HeroAct } from "./_marketing/hero-marquee";
import { ClassPosters, type ClassItem } from "./_marketing/class-posters";
import { RubricAct } from "./_marketing/rubric-act";
import { Testimonials, type Testimonial } from "./_marketing/testimonials";
import { StatStrip, type PublicStat } from "./_marketing/stat-strip-public";
import { FeaturedReel, type FeaturedPiece } from "./_marketing/featured-reel";
import { Reveal } from "./_marketing/reveal";
import { CurtainClose } from "./_marketing/curtain-close";

/* ------------------------------------------------------------------------- */
/* SEO                                                                       */
/* ------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: "Vik Theatre — Where every voice finds its stage",
  description:
    "India's most personal theatre and public-speaking studio for ages 6–18. Monologue labs, scene study, term-end showcases. Small batches. Real progress.",
  keywords: [
    "theatre class India",
    "public speaking for kids",
    "acting class Bangalore",
    "drama school teenagers",
    "Vik Theatre",
  ],
  openGraph: {
    title: "Vik Theatre — Where every voice finds its stage",
    description:
      "Monologue labs, scene study, and term-end showcases for ages 6–18. Small batches. Real progress.",
    type: "website",
    locale: "en_IN",
    siteName: "Vik Theatre",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vik Theatre — Where every voice finds its stage",
    description:
      "Monologue labs, scene study, and term-end showcases for ages 6–18.",
  },
};

/* ------------------------------------------------------------------------- */
/* Page data — hardcoded on purpose (public landing, cacheable)              */
/* ------------------------------------------------------------------------- */

const classes: ClassItem[] = [
  {
    title: "Monologue Lab",
    age: "Ages 10–14",
    desc: "Solo work. Diction, stage presence, emotional range. Camera on from day one.",
    fee: "₹4,800/mo",
    accent: "#E8C872",
    accent2: "#a37d2f",
    motif: "monologue",
  },
  {
    title: "Scene Study",
    age: "Ages 13–17",
    desc: "Partner scenes. Listening, reacting, owning the room with someone else in it.",
    fee: "₹5,400/mo",
    accent: "#8B5CF6",
    accent2: "#4a2b88",
    motif: "scene",
  },
  {
    title: "Showcase Ensemble",
    age: "Ages 14–18",
    desc: "A full production arc — auditions to opening night. Term-end public showcase.",
    fee: "₹6,500/mo",
    accent: "#E8C872",
    accent2: "#8B5CF6",
    motif: "showcase",
  },
  {
    title: "Little Stage",
    age: "Ages 6–9",
    desc: "Play-based. Storytelling, voice, imagination — no lines memorised, only courage.",
    fee: "₹3,900/mo",
    accent: "#f0d589",
    accent2: "#6c1028",
    motif: "little",
  },
];

// TODO: wire to a real /api/stats endpoint once we have one. These are
// realistic pilot numbers Vik cited for 2019–2026.
const stats: PublicStat[] = [
  { label: "STUDENTS COACHED", value: 120, suffix: "+", accent: "gold" },
  { label: "YEARS RUNNING", value: 7, accent: "violet" },
  { label: "LIVE SHOWCASES", value: 14, accent: "gold" },
  { label: "CITIES", value: 2, accent: "violet" },
];

// TODO: wire to CMS — placeholder testimonials for now.
const testimonials: Testimonial[] = [
  {
    quote:
      "My daughter went from refusing to speak in class to anchoring her school assembly. Six months.",
    name: "Priya R.",
    role: "Parent · Bangalore",
    signatureSeed: 0,
  },
  {
    quote:
      "The rubric is what sold me. Not vibes — actual, specific feedback every single week.",
    name: "Karan M.",
    role: "Parent · Bangalore",
    signatureSeed: 2,
  },
  {
    quote:
      "First audition I didn't apologise for my voice. I knew what my voice could do.",
    name: "Arya, 15",
    role: "Student · Scene Study",
    signatureSeed: 4,
  },
  {
    quote:
      "The channel is genius. I rewatch my monologues from term one and I'm actually proud.",
    name: "Ishaan, 13",
    role: "Student · Monologue Lab",
    signatureSeed: 1,
  },
  {
    quote:
      "Vik treats kids like actors, not students. That changes how they show up everywhere.",
    name: "Meera S.",
    role: "Parent · Mumbai",
    signatureSeed: 5,
  },
  {
    quote:
      "The showcase was the best forty-five minutes I've had in a theatre this year.",
    name: "Rohit D.",
    role: "Parent · Bangalore",
    signatureSeed: 3,
  },
];

const featured: FeaturedPiece[] = [
  { title: "The Glass Menagerie (excerpt)", tag: "SCENE", year: "2025", accentA: "#E8C872", accentB: "#6c1028" },
  { title: "Stopping by Woods", tag: "MONOLOGUE", year: "2025", accentA: "#8B5CF6", accentB: "#1a0d22" },
  { title: "Midsummer Night's Dream", tag: "SHOWCASE", year: "2024", accentA: "#E8C872", accentB: "#4a2b88" },
  { title: "Where the Wild Things Are", tag: "LITTLE STAGE", year: "2024", accentA: "#f0d589", accentB: "#2a0a18" },
];

/* ------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <>
      {/* Cursor-following spotlight (desktop, no-reduced-motion). Fixed overlay. */}
      <SpotlightCursor />

      <StageNav />

      <main id="main" className="relative z-[1] overflow-hidden">
        {/* Page-wide theatre wash */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(1400px 700px at 20% 0%, rgba(139,92,246,0.16) 0%, transparent 60%), radial-gradient(1100px 600px at 90% 100%, rgba(232,200,114,0.14) 0%, transparent 60%)",
          }}
        />

        {/* ACT I — The Invitation */}
        <HeroAct />

        {/* Stats strip */}
        <section className="relative z-[3] mx-auto max-w-7xl px-5 md:px-8 -mt-10 md:-mt-14">
          <StatStrip stats={stats} />
        </section>

        {/* ACT II — Find Your Class */}
        <section
          id="classes"
          className="relative z-[3] mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32 scroll-mt-24"
        >
          <Reveal className="mb-10 md:mb-14 max-w-2xl">
            <div className="text-[11px] tracking-[0.55em] text-[#E8C872]/80 mb-3">
              ACT II  ·  WHAT YOU&apos;LL LEARN
            </div>
            <h2 className="serif text-4xl md:text-6xl font-black leading-[1.02]">
              Four stages.{" "}
              <em className="not-italic text-[#E8C872]">One voice</em> — yours.
            </h2>
            <p className="mt-5 text-[15px] md:text-base text-[#C9C9D1] max-w-xl leading-relaxed">
              Pick the room that fits the moment you&apos;re in. Every batch caps
              at ten so no one disappears into the wings.
            </p>
          </Reveal>

          <ClassPosters classes={classes} />

          <Reveal delay={0.15} className="mt-12 text-center">
            <Link
              href={"/login" as Route}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#E8C872]/40 bg-[#E8C872]/5 px-6 text-sm font-semibold text-[#E8C872] transition-all hover:bg-[#E8C872]/10 hover:border-[#E8C872]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60"
            >
              Book a free 30-minute trial →
            </Link>
          </Reveal>
        </section>

        {/* ACT III — Inside a Class */}
        <section
          id="inside"
          className="relative z-[3] mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28 scroll-mt-24"
        >
          <RubricAct />
        </section>

        {/* Featured reel */}
        <section className="relative z-[3] mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
          <Reveal className="mb-8 md:mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="text-[11px] tracking-[0.55em] text-[#E8C872]/80 mb-2">
                NOW PLAYING
              </div>
              <h2 className="serif text-3xl md:text-5xl font-black leading-[1.05]">
                The work, in its own words.
              </h2>
            </div>
            <div className="hidden md:block text-xs tracking-[0.3em] text-[#8A8A96]">
              TERM-END SHOWCASES · 2024–25
            </div>
          </Reveal>
          <FeaturedReel pieces={featured} />
        </section>

        {/* ACT IV — Voices */}
        <section
          id="voices"
          className="relative z-[3] mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32 scroll-mt-24"
        >
          <Reveal className="mb-10 md:mb-14 max-w-2xl">
            <div className="text-[11px] tracking-[0.55em] text-[#E8C872]/80 mb-3">
              ACT IV  ·  THE REVIEWS ARE IN
            </div>
            <h2 className="serif text-4xl md:text-6xl font-black leading-[1.02]">
              Parents and students,{" "}
              <em className="not-italic text-[#E8C872]">after curtain</em>.
            </h2>
          </Reveal>
          <Testimonials items={testimonials} />
        </section>

        {/* About */}
        <section
          id="about"
          className="relative z-[3] mx-auto max-w-5xl px-5 md:px-8 py-20 md:py-28 scroll-mt-24"
        >
          <Reveal className="text-center">
            <div className="text-[11px] tracking-[0.55em] text-[#E8C872]/80 mb-4">
              THE STUDIO
            </div>
            <h2 className="serif text-3xl md:text-5xl font-black leading-[1.05]">
              A small studio.{" "}
              <em className="not-italic text-[#E8C872]">Big rooms</em>.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15px] md:text-base leading-relaxed text-[#C9C9D1]">
              Vik Theatre was founded in 2019 in Bangalore by Vik Prasad —
              theatre practitioner, former TEDx speaker coach, and director of
              twelve staged productions. The studio runs year-round batches
              across three evenings a week, plus a term-end public showcase
              every six months. It&apos;s intentionally small. The whole point
              is that nobody in a Vik Theatre class gets to hide.
            </p>
          </Reveal>
        </section>

        {/* ACT V — Curtain Up (final CTA) */}
        <section className="relative z-[3] mx-auto max-w-5xl px-5 md:px-8 pb-28 md:pb-40 text-center">
          <CurtainClose />
          <Reveal>
            <div className="text-[11px] tracking-[0.55em] text-[#E8C872]/80 mb-4">
              ACT V  ·  CURTAIN UP
            </div>
            <h2
              className="serif font-black leading-[0.98]"
              style={{
                fontSize: "clamp(2.6rem, 9vw, 6.5rem)",
                textShadow: "0 0 60px rgba(232,200,114,0.2)",
              }}
            >
              Your scene starts{" "}
              <em
                className="not-italic"
                style={{
                  color: "#E8C872",
                  textShadow: "0 0 44px rgba(232,200,114,0.6)",
                }}
              >
                here
              </em>
              <span className="text-[#E8C872]">.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[15px] md:text-base text-[#C9C9D1]">
              Free 30-minute trial. No camera, no script, no audition. Just come
              and read something out loud.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <Link
                href={"/login" as Route}
                aria-label="Book a trial class — final call-to-action"
                className="group relative inline-flex h-16 items-center justify-center rounded-2xl px-10 text-base font-bold text-black transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E8C872]/60 active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(180deg, #f2d58a 0%, #E8C872 55%, #c9a656 100%)",
                  boxShadow:
                    "0 24px 60px -10px rgba(232,200,114,0.65), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.15)",
                }}
              >
                <span className="relative z-[1] flex items-center gap-3 tracking-wide">
                  Book a Trial Class
                  <span aria-hidden>→</span>
                </span>
              </Link>
              <a
                href="mailto:hello@viktheatre.in"
                className="inline-flex h-16 items-center justify-center rounded-2xl border border-[#2A2A36] bg-[#15151C]/70 px-6 text-sm font-semibold text-[#F5F5F7] backdrop-blur transition-colors hover:border-[#E8C872]/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60"
              >
                hello@viktheatre.in
              </a>
            </div>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="relative z-[3] border-t border-[#2A2A36] bg-[#0B0B0F]/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-12 grid gap-8 md:grid-cols-3">
            <div>
              <div className="serif text-xl font-black">
                Vik<span className="text-[#E8C872]">.</span> Theatre
              </div>
              <p className="mt-3 text-sm text-[#8A8A96] leading-relaxed max-w-xs">
                Where every voice finds its stage. Crafted in Bangalore, staged
                wherever you are.
              </p>
            </div>
            <nav aria-label="Footer" className="text-sm text-[#C9C9D1] space-y-2">
              <div className="text-[10px] tracking-[0.35em] text-[#8A8A96] mb-3">
                STUDIO
              </div>
              <a href="#classes" className="block hover:text-white">
                Classes
              </a>
              <a href="#inside" className="block hover:text-white">
                Inside a class
              </a>
              <a href="#voices" className="block hover:text-white">
                Voices
              </a>
              <Link href={"/login" as Route} className="block hover:text-white">
                Student login
              </Link>
            </nav>
            <div className="text-sm text-[#C9C9D1] space-y-2">
              <div className="text-[10px] tracking-[0.35em] text-[#8A8A96] mb-3">
                CONTACT
              </div>
              <a href="mailto:hello@viktheatre.in" className="block hover:text-white">
                hello@viktheatre.in
              </a>
              <div className="text-[#8A8A96]">Bangalore · Mumbai</div>
            </div>
          </div>
          <div className="border-t border-[#2A2A36] py-5 text-center text-xs text-[#8A8A96]">
            © {new Date().getFullYear()} Vik Theatre. All rights reserved.
          </div>
        </footer>
      </main>
    </>
  );
}
