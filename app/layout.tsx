import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import { AppPreferencesProvider } from "@/components/providers/app-preferences-provider";
import { AppPreferencesDock } from "@/components/layout/app-preferences-dock";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "FalconHire AI — GCC Interview Copilot",
    template: "%s · FalconHire AI",
  },
  description:
    "AI-powered UAE/GCC interview preparation with streaming mock HR screens, recruiter scoring, resume analysis, and LinkedIn optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark h-full ${geistSans.variable} ${geistMono.variable} ${notoArabic.variable}`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <AuthSessionProvider>
          <AppPreferencesProvider>
            <div className="relative min-h-full">
              <AmbientBackground />
              <SiteHeader />
              <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                {children}
              </div>
            </div>
            <AppPreferencesDock />
          </AppPreferencesProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
