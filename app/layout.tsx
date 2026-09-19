import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language";
import AccessibilityBar from "@/components/AccessibilityBar";

export const metadata: Metadata = {
  title: "APIx — National Airfare Price Index | MoSPI",
  description:
    "Real-Time Airfare Price Index for CPI Augmentation. Ministry of Statistics and Programme Implementation, Government of India.",
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
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <AccessibilityBar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
