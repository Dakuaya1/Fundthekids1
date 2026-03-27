import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import BottomNav from "@/components/navigation/BottomNav";
import LandingOverlay from "@/components/LandingOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextGenius",
  description: "A platform for discovering, verifying, and supporting exceptional children.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="app-shell">
            <LandingOverlay />
            <div className="aurora-orb animate-pulse-drift -left-16 top-16 h-72 w-72 bg-blue-300/25 dark:bg-blue-500/12" />
            <div className="aurora-orb animate-pulse-drift right-[-5rem] top-80 h-80 w-80 bg-cyan-300/20 dark:bg-cyan-500/10" style={{ animationDelay: "2s" }} />
            <div className="aurora-orb animate-pulse-drift bottom-12 left-1/3 h-64 w-64 bg-indigo-300/18 dark:bg-indigo-500/10" style={{ animationDelay: "4s" }} />
            <div className="layout-frame">
              {children}
            </div>
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
