// apps/web/src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Topbar from "@/components/ui/Topbar";
import Chatbot from "@/components/Chatbot";

/**
 * Fonts:
 * - نستخدم next/font لحقن متغيرات CSS (بدون FOUT)
 * - متوافق مع الـ classes المستخدمة في globals.css
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

/**
 * Metadata + Viewport:
 * - theme-color ديناميكي عبر media لتوافق المتصفحات
 * - العنوان يؤخذ من ENV إن وُجد
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

/**
 * RootLayout:
 * - نبدأ بـ lang=ar و dir=rtl افتراضيًا، وبنعدّل فورًا قبل الرسم عبر سكربت صغير داخل <head>
 * - السكربت يقرأ localStorage: lang, theme
 * - لو theme="dark" بنضيف .dark على <html> (مُفعّل مع Tailwind)
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* تهيئة مبكرة جدًا: اللغة/الاتجاه والثيم بدون فلاش */}
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
        className={[
          geistSans.variable,
          geistMono.variable,
          // خلفية متدرجة لطيفة (Light/Dark) + Anti-aliased + طول الشاشة
          "antialiased min-h-dvh",
          "bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff]",
          "dark:from-[#0b0b0f] dark:via-black dark:to-[#0c0f1a]",
          // ألوان الثيم من CSS Vars المعرفة في globals.css
          "bg-background text-foreground",
        ].join(" ")}
      >
        {/* شريط علوي؛ خليه يقرأ اللغة/الثيم ويعرض سويتشر (إن كان موجود داخله) */}
        <Topbar />

        <main className="mx-auto max-w-7xl px-4 py-10">
          {/* خلفية زجاجية ببلوبات متحركة خفيفة (غير تداخلية) */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-24 -end-24 size-72 rounded-full bg-blue-200/40 blur-3xl animate-pulse dark:bg-blue-900/30" />
            <div className="absolute -bottom-24 -start-24 size-72 rounded-full bg-purple-200/40 blur-3xl animate-pulse [animation-delay:300ms] dark:bg-purple-900/30" />
          </div>

          {children}
        </main>

        <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-black/60 dark:text-white/60">
          <div className="flex items-center justify-between">
            <span>
              © {new Date().getFullYear()} •{" "}
              {process.env.NEXT_PUBLIC_APP_NAME || "CV Matcher"}
            </span>
            <span className="font-mono">Next.js • Tailwind • Motion</span>
          </div>
        </footer>

        {/* المساعد العائم (يدعم AR/EN تلقائيًا حسب localStorage) */}
        <Chatbot />
      </body>
    </html>
  );
}
