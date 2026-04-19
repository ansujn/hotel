import type { Metadata, Route } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CategoryNav } from "./category-nav";
import { SectionAccordion } from "./section-accordion";

/* -------------------------------------------------------------------------- */
/*  Metadata + SEO                                                            */
/* -------------------------------------------------------------------------- */

const DESCRIPTION =
  "Trial bookings, fees, batch schedules, consent and safety, the parent portal — everything parents ask about Vik Theatre classes for ages 6 to 18, answered plainly.";

export const metadata: Metadata = {
  title: "FAQ · Vik Theatre",
  description: DESCRIPTION,
  openGraph: {
    title: "FAQ · Vik Theatre",
    description: DESCRIPTION,
    type: "website",
    siteName: "Vik Theatre",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ · Vik Theatre",
    description: DESCRIPTION,
  },
  alternates: {
    canonical: "/faq",
  },
};

/* -------------------------------------------------------------------------- */
/*  Content — single source of truth for rendered DOM + JSON-LD FAQPage       */
/* -------------------------------------------------------------------------- */

interface PlainQA {
  q: string;
  /** Plain-text answer used for both rendering and JSON-LD. */
  a: string;
}

interface Section {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  blurb: string;
  items: PlainQA[];
}

const SECTIONS: Section[] = [
  {
    id: "classes",
    label: "Classes",
    eyebrow: "ACT ONE",
    title: "The four tracks",
    blurb:
      "Four tracks, grouped by age and intent. Each is designed so the craft grows with the student.",
    items: [
      {
        q: "Which class is right for my child?",
        a: "Little Stage is ages 6–9 (play-based). Monologue Lab is 10–14 (solo work, diction, presence). Scene Study is 13–17 (partner scenes, listening). Showcase Ensemble is 14–18 (term-end public performance). When in doubt, book a free trial and we will place your child after watching them work.",
      },
      {
        q: "What is the difference between Monologue Lab and Scene Study?",
        a: "Monologue Lab is solo work — one performer, one text, their voice and body. Scene Study is two-person work — listening, reacting, sharing space. Most students benefit from Monologue Lab first, then Scene Study once they are confident alone on stage.",
      },
      {
        q: "Can my child take both theatre and public speaking?",
        a: "Yes. The tracks build on each other — stagecraft from theatre makes speaking more compelling, and the clarity from speaking makes scenes sharper. We will recommend a combined plan at the trial if it fits your child.",
      },
      {
        q: "My child is very shy. Will this work for them?",
        a: "Often, yes. The tracks are deliberately small and warm, and our coaches are trained to meet quieter students where they are. Most shy students find their footing within the first three or four sessions.",
      },
      {
        q: "Is there a term-end performance?",
        a: "Yes — Showcase Ensemble culminates in a public showcase each term. Other tracks do smaller in-studio sharings so families can see progress without the pressure of a full production.",
      },
    ],
  },
  {
    id: "schedule",
    label: "Batches & Schedule",
    eyebrow: "THE CALL SHEET",
    title: "Batches and timings",
    blurb:
      "Small batches, fixed weekly slots, and a clear make-up policy so no session is lost.",
    items: [
      {
        q: "How big are the batches?",
        a: "Small on purpose — around 10 students per batch in the pilot. This lets every student get direct coaching time each session instead of waiting their turn.",
      },
      {
        q: "When do classes run?",
        a: "Typical slots are Thursday evenings, Saturday mornings, and Sunday afternoons for the younger tracks. Exact timings are confirmed when we place your child in a batch.",
      },
      {
        q: "What happens if my child misses a class?",
        a: "Let us know ahead of time on WhatsApp and we will arrange a make-up session in a parallel batch within the same month, subject to space. Recordings of the missed class are also posted to your child's channel.",
      },
      {
        q: "Are classes in-person or online?",
        a: "Primarily in-person in Bangalore. Online sessions are available by arrangement for students outside the city or during travel — tell us and we will work it out.",
      },
      {
        q: "Can siblings be placed in the same batch?",
        a: "If they fall within the same age track and a slot is free, yes. Otherwise they will be placed in age-appropriate batches that often run back-to-back so school-run logistics stay simple.",
      },
    ],
  },
  {
    id: "fees",
    label: "Fees & Refunds",
    eyebrow: "HOUSEKEEPING",
    title: "Fees, refunds, billing",
    blurb:
      "Transparent monthly pricing in rupees. Razorpay handles payment — UPI, cards, and netbanking.",
    items: [
      {
        q: "How much do classes cost?",
        a: "Fees run from ₹3,900 to ₹6,500 per month depending on the track — Little Stage is the lightest and Showcase Ensemble the most intensive. Fees are billed monthly through the parent portal.",
      },
      {
        q: "Can I pay quarterly instead of monthly?",
        a: "Yes. Quarterly payment is available from the parent portal and carries a small discount. Message us on WhatsApp if you would prefer annual billing for a sibling plan.",
      },
      {
        q: "What is included in the fee?",
        a: "All weekly sessions, coaching notes after each class, access to your child's private video channel, parent-portal access, and term-end sharings. Showcase production costs are included for Ensemble students.",
      },
      {
        q: "What is the refund policy?",
        a: "The first class is free. After that, if you withdraw within the first two weeks of a billing month we refund the unused portion. After two weeks the month is non-refundable, but credit can roll over to a sibling or the next month.",
      },
      {
        q: "Is there a sibling discount?",
        a: "Yes, but it is negotiated case by case. Message us on WhatsApp with your children's ages and the tracks you are considering and we will share the combined quote.",
      },
      {
        q: "How do I pay?",
        a: "Through Razorpay, linked from the parent portal — UPI, debit and credit cards, and netbanking all work. Receipts are emailed automatically via our billing system.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Safety & Privacy",
    eyebrow: "BACKSTAGE",
    title: "Safety, consent, and your child's data",
    blurb:
      "We take publishing consent seriously. Nothing of your child goes public without your explicit, expiring consent.",
    items: [
      {
        q: "Who can see my child's recordings?",
        a: "By default, only you, your child, and the coaching team. Recordings are stored on a private channel inside the parent portal and are never public unless you sign a publishing consent for a specific piece.",
      },
      {
        q: "What does 'public' mean for a piece of work?",
        a: "Public means a specific recording — a monologue, a scene, a showcase clip — is approved to be shared on the Vik Theatre social handles or embedded on the company website. Everything else stays private.",
      },
      {
        q: "How does publishing consent work?",
        a: "When we would like to share a piece, you receive a consent request in the parent portal. You choose whether to approve, and you pick how long the consent lasts — 6, 12, or 24 months. After that window, the piece returns to private unless you renew consent.",
      },
      {
        q: "Is this DPDP Act compliant?",
        a: "Yes. Our consent flow is designed to meet India's Digital Personal Data Protection Act, 2023 for minors — parent-signed, purpose-limited, time-bound, and revocable at any time from the parent portal.",
      },
      {
        q: "Can I revoke consent after I have given it?",
        a: "Yes, any time. Revocation takes effect immediately on our platform. For content already shared on third-party social platforms we will request takedown promptly, typically within a few working days.",
      },
      {
        q: "Can I have my child's data deleted?",
        a: "Yes. Email hello@viktheatre.in from your registered address and we will delete your child's account, recordings, and associated data within thirty days, retaining only what Indian law requires us to keep (such as payment records).",
      },
    ],
  },
  {
    id: "uploads",
    label: "Uploads & Channel",
    eyebrow: "ON THE RECORD",
    title: "Your child's video channel",
    blurb:
      "Every student gets a private channel where their rehearsal and performance clips live — always available to you.",
    items: [
      {
        q: "What gets recorded?",
        a: "Weekly exercises, monologue passes, scene runs, and performance sharings. You will see new clips land on your child's channel within a day or two of each class.",
      },
      {
        q: "Can I watch the videos from outside India?",
        a: "Yes. The parent portal and video playback work anywhere with a reasonable internet connection. Video streams adapt to your connection speed.",
      },
      {
        q: "Is my child's face visible in the videos?",
        a: "In private coaching recordings, yes — that is the point, so you can see their work. In public pieces (which only exist after you sign consent), you control whether the piece can be shared.",
      },
      {
        q: "Can I download my child's videos?",
        a: "Yes. From the parent portal you can request a download of any clip on your child's channel. We will email a secure download link, usually within a few minutes.",
      },
      {
        q: "How long are videos kept?",
        a: "Indefinitely, unless you ask us to delete them. Some families like having the full archive across years; others prefer a lighter footprint. Both are fine — you are in control.",
      },
    ],
  },
  {
    id: "portal",
    label: "Parent Portal",
    eyebrow: "THE BOOTH",
    title: "Using the parent portal",
    blurb:
      "One dashboard for progress, payments, consent, and communication. No apps to install.",
    items: [
      {
        q: "What do I see in the parent portal?",
        a: "Your child's progress over the term, recent clips from their channel, upcoming payments, pending consent requests, and coach notes from each class. You can also message the coaching team.",
      },
      {
        q: "Will I get notifications?",
        a: "Yes — by email through Brevo, with optional WhatsApp alerts for important events like a new consent request, a missed payment, or a showcase date. You choose what you receive in portal settings.",
      },
      {
        q: "How do I change my password?",
        a: "Go to Account in the parent portal and choose Change Password. If you have forgotten it, use the 'forgot password' link on the login page and we will email a reset link.",
      },
      {
        q: "Who do I contact if I can't log in?",
        a: "WhatsApp us and we will reset your access the same day — see the Contact section below. Please message from the number you registered with so we can verify you quickly.",
      },
    ],
  },
  {
    id: "trial",
    label: "Trial Class",
    eyebrow: "YOUR CUE",
    title: "Booking a trial class",
    blurb:
      "The first class is free. Come watch your child work with our coaches before you commit to anything.",
    items: [
      {
        q: "How do I book a trial?",
        a: "Click 'Book a trial' below or from the top of the site. You will leave your contact details and preferred track, and we will confirm a slot on WhatsApp the same day.",
      },
      {
        q: "Is the trial really free?",
        a: "Yes. No card details at booking, no obligation after. If your child enjoys it and you want to continue, we enrol them starting the following week.",
      },
      {
        q: "What should my child prepare for the trial?",
        a: "Nothing at all. Comfortable clothes, a water bottle, and arrive fifteen minutes early so we can say hello. The coaches take it from there.",
      },
      {
        q: "What if my child is too nervous on the day?",
        a: "It happens often and it is fine. Our coaches can have them observe first and join in gradually. If the trial does not land, we will offer a second free session before you decide.",
      },
      {
        q: "How do I cancel or reschedule?",
        a: "Reply to the WhatsApp confirmation. We can reschedule as late as the morning of the class — just let us know so we can give the spot to another family if needed.",
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    eyebrow: "CURTAIN CALL",
    title: "Getting in touch",
    blurb: "We read every message. Same-day replies on working days.",
    items: [
      {
        q: "What is the fastest way to reach you?",
        a: "WhatsApp. Message +91 98xxx xxxxx and you will usually hear back within a few hours on working days, same day at the latest.",
      },
      {
        q: "Do you answer email?",
        a: "Yes — hello@viktheatre.in. Expect a reply within one working day. For trial bookings, WhatsApp is faster.",
      },
      {
        q: "Where are you based?",
        a: "Bangalore, India. Our pilot batches are in-person in the city. Online arrangements are possible for families elsewhere in India and abroad.",
      },
    ],
  },
];

/** Flatten for JSON-LD FAQPage */
const ALL_QA = SECTIONS.flatMap((s) => s.items);

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_QA.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function FAQPage() {
  const categories = SECTIONS.map(({ id, label }) => ({ id, label }));

  return (
    <main className="min-h-screen bg-[#0B0B0F]">
      {/* JSON-LD FAQPage for rich snippets */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      {/* TODO: extract to shared Nav component (mirrors app/page.tsx) */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-8">
        <Link
          href={"/" as Route}
          className="serif text-xl font-black md:text-2xl"
        >
          Vik<span className="text-[#E8C872]">.</span> Theatre
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href={"/login" as Route} className="hidden sm:inline-flex">
            <Button variant="ghost" size="md">
              Login
            </Button>
          </Link>
          <Link href={"/login" as Route}>
            <Button variant="primary" size="md">
              Book Trial
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Soft gradient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(900px 500px at 15% 10%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(800px 500px at 85% 0%, rgba(232,200,114,0.12), transparent 65%)",
          }}
        />

        {/* Signature drifting mask — disabled under reduced motion */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-40px] top-[30%] -z-0 hidden opacity-[0.07] motion-reduce:hidden md:block"
          style={{
            animation: "faq-drift 14s ease-in-out infinite alternate",
          }}
        >
          <svg
            width="320"
            height="320"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Theatre comedy/tragedy mask — simplified */}
            <path
              d="M32 6c-10 0-18 7-18 17 0 14 10 22 18 29 8-7 18-15 18-29 0-10-8-17-18-17z"
              stroke="#E8C872"
              strokeWidth="1.2"
            />
            <ellipse cx="25" cy="25" rx="2.5" ry="1.5" fill="#E8C872" />
            <ellipse cx="39" cy="25" rx="2.5" ry="1.5" fill="#E8C872" />
            <path
              d="M22 36c3 3 7 4 10 4s7-1 10-4"
              stroke="#E8C872"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
          <div className="text-[11px] tracking-[0.3em] text-[#E8C872] md:text-xs">
            PROGRAM NOTES · BEFORE THE SHOW
          </div>
          <h1 className="serif mt-5 text-4xl font-black leading-[1.05] md:text-6xl">
            Questions,{" "}
            <em className="not-italic text-[#E8C872]">answered</em>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#C9C9D1] md:text-lg">
            Everything parents ask before booking a trial — fees, schedules,
            consent, the video channel — written plainly, in one place.
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs text-[#8A8A96]">
            <span className="inline-block h-[1px] w-10 bg-[#2A2A36]" />
            <span className="tracking-widest">{ALL_QA.length} answers · 8 acts</span>
          </div>
        </div>
      </section>

      {/* Category chip strip */}
      <CategoryNav categories={categories} />

      {/* Sections */}
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-6 md:pt-16">
        {SECTIONS.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 pb-14 md:scroll-mt-28 md:pb-20"
          >
            {/* Subtle gradient divider above every section after the first */}
            {idx > 0 ? (
              <div
                aria-hidden
                className="mb-12 h-px w-full opacity-60"
                style={{
                  background:
                    "linear-gradient(to right, transparent, #2A2A36 20%, #2A2A36 80%, transparent)",
                }}
              />
            ) : null}

            <SectionHeading
              eyebrow={section.eyebrow}
              title={section.title}
              blurb={section.blurb}
            />

            <div className="mt-7">
              <SectionAccordion
                sectionId={section.id}
                items={section.items.map((i) => ({
                  q: i.q,
                  a: <p>{i.a}</p>,
                }))}
              />
            </div>
          </section>
        ))}

        {/* Final CTA */}
        <FinalCTA />
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2A2A36] py-8 text-center text-sm text-[#8A8A96]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 md:flex-row md:px-8">
          <div>© {new Date().getFullYear()} Vik Theatre. Crafted in Bangalore.</div>
          <div className="flex items-center gap-4">
            <Link href={"/" as Route} className="hover:text-white">
              Home
            </Link>
            <Link href={"/login" as Route} className="hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </footer>

      {/* Local keyframes for the drifting mask */}
      <style>
        {`@keyframes faq-drift {
          0% { transform: translate3d(0, 0, 0) rotate(-2deg); }
          100% { transform: translate3d(-20px, 30px, 0) rotate(2deg); }
        }`}
      </style>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Subcomponents (server)                                                    */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  return (
    <div className="group">
      <div className="text-[10px] tracking-[0.3em] text-[#E8C872]/80 md:text-[11px]">
        {eyebrow}
      </div>
      <h2 className="serif mt-2 text-2xl font-black leading-tight md:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8A8A96] md:text-[15px]">
        {blurb}
      </p>
    </div>
  );
}

function FinalCTA() {
  return (
    <section
      aria-labelledby="faq-final-cta"
      className="mt-10 overflow-hidden rounded-2xl border border-[#2A2A36] bg-gradient-to-br from-[#15151C] via-[#141420] to-[#1a1430] p-6 md:p-10"
    >
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <div className="text-[11px] tracking-[0.3em] text-[#E8C872]">
            STILL HAVE A QUESTION?
          </div>
          <h2
            id="faq-final-cta"
            className="serif mt-3 text-2xl font-black leading-tight md:text-3xl"
          >
            We will answer the <em className="not-italic text-[#E8C872]">same day</em>.
          </h2>
          <p className="mt-3 text-sm text-[#C9C9D1] md:text-[15px]">
            The fastest route is WhatsApp. Or email us — we read everything.
          </p>

          {/* TODO: real contact */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <a
              href="https://wa.me/9198xxxxxxxx"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A36] bg-[#0B0B0F] px-3.5 py-2 text-[#F5F5F7] transition-colors hover:border-[#E8C872]/50"
            >
              <span aria-hidden>WhatsApp</span>
              <span className="text-[#C9C9D1]">+91 98xxx xxxxx</span>
            </a>
            <a
              href="mailto:hello@viktheatre.in"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A36] bg-[#0B0B0F] px-3.5 py-2 text-[#F5F5F7] transition-colors hover:border-[#E8C872]/50"
            >
              <span aria-hidden>Email</span>
              <span className="text-[#C9C9D1]">hello@viktheatre.in</span>
            </a>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <Link href={"/login" as Route} className="block">
            <Button variant="primary" size="lg" className="w-full md:w-auto">
              Book a trial
            </Button>
          </Link>
          <p className="mt-2 text-center text-xs text-[#8A8A96] md:text-right">
            First class is free.
          </p>
        </div>
      </div>
    </section>
  );
}
