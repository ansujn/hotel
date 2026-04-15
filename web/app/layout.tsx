import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vik Theatre",
  description: "Where every voice finds its stage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0B0B0F] text-[#F5F5F7] antialiased">{children}</body>
    </html>
  );
}
