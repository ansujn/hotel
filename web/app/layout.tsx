import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kibana.saudagars.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kibana Jaipur · Rooftop dining & banquets in the Pink City",
    template: "%s · Kibana Jaipur",
  },
  description:
    "Modern Indian and global flavours on a Jaipur rooftop. Five banquet halls for weddings, corporate events, and intimate gatherings.",
  openGraph: {
    type: "website",
    siteName: "Kibana Jaipur",
    title: "Kibana Jaipur",
    description:
      "Rooftop dining and banquet halls in the Pink City. Reserve, browse the menu, host an event.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kibana Jaipur",
    description: "Rooftop dining & banquet halls in Jaipur.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-[#FBF8F1] text-[#3B1F1A] antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
