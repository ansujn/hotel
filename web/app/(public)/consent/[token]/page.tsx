import type { Metadata } from "next";
import { getConsentContext } from "@/lib/consent";
import { ConsentForm } from "./consent-form";

export const metadata: Metadata = {
  title: "Parental Consent · Vik Theatre",
  description:
    "Review and sign consent for your child's theatre recording. DPDP-compliant, revocable anytime.",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ConsentPage({ params }: PageProps) {
  const { token } = await params;
  // Server-prefetch context for SEO-less fast paint; client form can refetch.
  const context = await getConsentContext(token);

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#F5F5F7]">
      <ConsentForm token={token} initialContext={context} />
    </main>
  );
}
