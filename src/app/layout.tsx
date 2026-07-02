import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DevAbortSuppressor } from "@/components/providers/DevAbortSuppressor";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Frontend Forever",
  description:
    "An interactive frontend engineering learning platform — concepts become visible, interactive, and understandable through live simulators.",
};

// Runs before paint to avoid a flash of the wrong theme. Reads the same
// localStorage key ThemeProvider uses, so the two never disagree.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        {/* next/script (beforeInteractive) inlines this into the document so it
            runs before paint — preventing the theme flash — without React
            rendering a raw <script> element (which React 19 rejects on the
            client). */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <DevAbortSuppressor />
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
