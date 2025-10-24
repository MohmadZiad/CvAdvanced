// apps/web/src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Topbar from "@/components/ui/Topbar";
import Chatbot from "@/components/Chatbot";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Fonts
 */
const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Metadata + Viewport
 */
export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "CV Matcher",
  description: "Modern bilingual UI for CV–Job matching",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b10" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* تهيئة مبكرة للّغة/الاتجاه والثيم لتجنب الفلاش */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var ls = window.localStorage;
    var lang = (ls.getItem("lang") || "ar");
    var theme = (ls.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
    var html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    if (theme === "dark") html.classList.add("dark"); else html.classList.remove("dark");
  } catch (_) {}
})();
            `,
          }}
        />
      </head>

      <body
        suppressHydrationWarning
        className={cn(
          "min-h-dvh bg-background font-sans text-foreground antialiased",
          display.variable,
          sans.variable,
          mono.variable,
          "relative overflow-x-hidden"
        )}
      >
        <ThemeProvider>
          <div className="pointer-events-none fixed inset-0 -z-20">
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(120%_120%_at_0%_100%,rgba(129,86,255,0.18),transparent_45%)]" />
            <div
              aria-hidden
              className="absolute inset-0 animate-glow"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(20,184,166,0.25), transparent 55%), radial-gradient(circle at 80% 10%, rgba(37,99,235,0.2), transparent 50%)",
              }}
            />
          </div>

          <div className="pointer-events-none fixed inset-x-0 top-0 z-[-10] h-24 bg-gradient-to-b from-white/70 via-white/10 to-transparent dark:from-black/60 dark:via-black/20" />

          <div className="relative z-10 flex min-h-dvh flex-col">
            <Topbar />
            <main className="container relative flex-1 pb-20 pt-10">
              {children}
            </main>

            <footer className="container pb-10 text-xs text-foreground/60">
              <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white/50 px-6 py-4 backdrop-blur-md dark:bg-white/10 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ⚡
                  </span>
                  <div>
                    <p className="font-medium">
                      {process.env.NEXT_PUBLIC_APP_NAME || "CV Matcher"}
                    </p>
                    <p className="text-[11px] text-foreground/50">
                      © {new Date().getFullYear()} • Crafted with Motion &
                      Accessibility first
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-foreground/60">
                  <span>Next.js</span>
                  <span className="inline-block h-0.5 w-4 rounded-full bg-foreground/30" />
                  <span>Tailwind</span>
                  <span className="inline-block h-0.5 w-4 rounded-full bg-foreground/30" />
                  <span>Motion</span>
                </div>
              </div>
            </footer>
          </div>

          <Chatbot />
          <Toaster richColors position="top-center" expand />
        </ThemeProvider>
      </body>
    </html>
  );
}
