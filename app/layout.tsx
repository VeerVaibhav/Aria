import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language";
import AccessibilityBar from "@/components/AccessibilityBar";
import SkipLink from "@/components/SkipLink";

export const metadata: Metadata = {
  title: "ARIA — Airfare Real-time Index & Analytics | SIH26056",
  description:
    "ARIA — Airfare Real-time Index & Analytics. Smart India Hackathon 2026 (SIH26056) student project for real-time Indian airfare indexing and corridor analytics.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <LanguageProvider>
          <SkipLink />
          <AccessibilityBar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
