// apps/web/src/app/page.tsx
import AIConsole from "@/components/AIConsole";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-white/70 px-8 py-12 text-center shadow-soft backdrop-blur dark:bg-white/10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_50%_0%,rgba(37,99,235,0.15),transparent),radial-gradient(80%_120%_at_50%_100%,rgba(139,92,246,0.18),transparent)]" />
        <p className="text-xs uppercase tracking-[0.38em] text-foreground/50">
          Precision Talent Intelligence
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-[2.75rem] sm:leading-tight">
          مساعد مطابقة السِيَر الذاتية مع الوظائف
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-foreground/60 sm:text-base">
          اكتب متطلبات الوظيفة، أرفق CV، واضغط «حلّل الآن» لمشاهدة النتيجة التفصيلية. كل خطوة مصممة لتمنحك رؤية فورية ودقيقة عبر واجهة سلسة وعالية الحرفية.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] text-foreground/50">
          <span className="tag bg-primary/10 text-primary">Realtime Scoring</span>
          <span className="tag">Arabic • English</span>
          <span className="tag">Private & Secure</span>
        </div>
      </header>

      <AIConsole />

      <div className="text-center text-xs uppercase tracking-[0.4em] text-foreground/40">
        جاهز للمقارنة والتصدير من صفحة النتائج
      </div>
    </div>
  );
}
