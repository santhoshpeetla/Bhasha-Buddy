import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const primaryFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BhashaBuddy - India-First Smart Document Analyzer",
  description: "Upload notices, circulars, and forms to instantly decode them in English, Telugu, or Hindi. With simple summaries, Grandma Mode, and Voice assistance.",
  keywords: ["OCR", "Translation", "India", "Government Notices", "Scholarships", "Telugu", "Hindi", "Accessibility"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${primaryFont.variable} ${bodyFont.variable} ${displayFont.variable} font-body h-full bg-[#fafafa] dark:bg-[#09090b] text-[#1f2937] dark:text-[#f3f4f6]`}>
        {children}
      </body>
    </html>
  );
}
