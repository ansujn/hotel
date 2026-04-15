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

export const metadata: Metadata = {
  title: "Vik Theatre",
  description: "Where every voice finds its stage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-[#0B0B0F] text-[#F5F5F7] antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
