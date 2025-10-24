// =============================
// apps/web/src/components/Chatbot.tsx
// =============================
"use client";

import {
  useEffect as useEffect2,
  useMemo as useMemo2,
  useState as useState2,
} from "react";
import {
  AnimatePresence as AnimatePresence2,
  motion as motion2,
} from "framer-motion";
import {
  MessageCircle,
  X as X2,
  Play as Play2,
  Loader2 as Loader22,
  Wand2 as Wand22,
} from "lucide-react";
import ScoreGauge from "./ui/ScoreGauge";
import { type Lang as Lang2, t as t2 } from "@/lib/i18n";
import { cvApi as cvApi2 } from "@/services/api/cv";
import { jobsApi as jobsApi2 } from "@/services/api/jobs";
import {
  analysesApi as analysesApi2,
  type Analysis as Analysis2,
} from "@/services/api/analyses";
import { Button as Button2 } from "@/components/ui/Button";

// Shape
type Msg2 = { role: "bot" | "user" | "sys"; text: string };

function getLangFromStorage2(): Lang2 {
  try {
    if (typeof window !== "undefined") {
      return (window.localStorage.getItem("lang") as Lang2) || "ar";
    }
  } catch {}
  return "ar";
}

export default function Chatbot() {
  const [open, setOpen] = useState2(false);
  const [lang, setLang] = useState2<Lang2>("ar");
  const tt = useMemo2(() => (p: string) => t2(lang, p), [lang]);

  useEffect2(() => {
    setLang(getLangFromStorage2());
    const onStorage = () => setLang(getLangFromStorage2());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [msgs, setMsgs] = useState2<Msg2[]>([
    { role: "bot", text: tt("chat.hello") },
  ]);
  const [cvs, setCvs] = useState2<any[]>([]);
  const [jobs, setJobs] = useState2<any[]>([]);
  const [cvId, setCvId] = useState2("");
  const [jobId, setJobId] = useState2("");
  const [jd, setJd] = useState2("");
  const [loading, setLoading] = useState2(false);
  const [suggesting, setSuggesting] = useState2(false);
  const [result, setResult] = useState2<Analysis2 | null>(null);

  useEffect2(() => {
    if (!open) return;
    cvApi2
      .list()
      .then((r) => setCvs(r.items))
      .catch(() => {});
    jobsApi2
      .list()
      .then((r) => setJobs(r.items))
      .catch(() => {});
  }, [open]);

  const handleSuggest = async () => {
    if (!jd.trim()) return;
    try {
      setSuggesting(true);
      const r = await jobsApi2.suggestFromJD(jd);
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text:
            `✅ ${tt("chat.aiSuggested")}:\n– ` +
            r.items
              .map(
                (i) =>
                  `${i.requirement}${i.mustHave ? " (must)" : ""} • w${i.weight}`
              )
              .join("\n– "),
        },
      ]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "bot", text: `AI Error: ${e.message}` }]);
    } finally {
      setSuggesting(false);
    }
  };

  const run = async () => {
    if (!cvId || !jobId) return;
    setLoading(true);
    setResult(null);
    setMsgs((m) => [...m, { role: "user", text: `${tt("chat.run")} ▶️` }]);
    try {
      const a = await analysesApi2.run({ jobId, cvId });
      const score = Number(a.score ?? 0);
      setResult(a);
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: `${tt("chat.done")} • ${tt("chat.score")}: ${score.toFixed(2)}`,
        },
      ]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "bot", text: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(600px_250px_at_10%_10%,rgba(99,102,241,.15),transparent_60%),radial-gradient(600px_250px_at_90%_30%,rgba(236,72,153,.15),transparent_60%)]" />

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 end-6 z-[60] grid size-14 place-items-center rounded-[1.75rem] bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground shadow-[0_20px_45px_-22px_rgba(37,99,235,0.75)] transition hover:scale-105"
        aria-label="Open Assistant"
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence2>
        {open && (
          <motion2.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
          >
            <motion2.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 130, damping: 16 }}
              className="absolute bottom-0 end-0 m-6 w-[min(520px,calc(100vw-3rem))] overflow-hidden rounded-[2.25rem] border border-border/40 bg-white/85 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:bg-white/10"
            >
              <div className="flex items-center justify-between border-b border-border/50 bg-white/60 px-6 py-4 dark:bg-white/5">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-foreground/50">Assistant</div>
                  <div className="text-sm font-semibold text-foreground">{tt("chat.title")}</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-xl border border-transparent bg-white/70 text-foreground/70 transition hover:border-border/70 hover:text-foreground dark:bg-white/5"
                >
                  <X2 size={18} />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-4 overflow-auto p-5">
                {msgs.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ms-auto max-w-[82%] rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg"
                        : m.role === "sys"
                          ? "mx-auto max-w-[70%] rounded-2xl border border-dashed border-border/60 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-foreground/50"
                          : "me-auto max-w-[82%] rounded-2xl border border-border/50 bg-white/85 px-4 py-3 text-sm text-foreground shadow-sm backdrop-blur dark:bg-white/10"
                    }
                  >
                    {m.text}
                  </div>
                ))}

                <div className="rounded-2xl border border-border/50 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-white/10">
                  <div className="mb-2 text-sm font-semibold text-foreground">
                    Job Description (اختياري)
                  </div>
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    className="min-h-[140px] w-full rounded-2xl border border-border/50 bg-white/90 px-4 py-3 text-sm leading-relaxed text-foreground/70 shadow-inner dark:bg-white/10"
                    placeholder="ألصق وصف الوظيفة هنا ثم اطلب من الذكاء توليد المتطلبات"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button2
                      onClick={handleSuggest}
                      disabled={!jd.trim() || suggesting}
                      className="border border-border/50 bg-white/80 text-foreground/70 transition hover:text-foreground dark:bg-white/10"
                    >
                      {suggesting ? (
                        <Loader22 className="me-2 size-4 animate-spin" />
                      ) : (
                        <Wand22 className="me-2 size-4" />
                      )}{" "}
                      {suggesting
                        ? "جارٍ الاستخراج..."
                        : "اقترح المتطلبات بالذكاء"}
                    </Button2>
                    <Button2 variant="ghost" onClick={() => setJd("")}>
                      مسح
                    </Button2>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/50 bg-white/85 p-4 shadow-sm backdrop-blur dark:bg-white/10">
                  <div className="text-xs uppercase tracking-[0.32em] text-foreground/50">{tt("chat.pickCv")}</div>
                  <select
                    value={cvId}
                    onChange={(e) => setCvId(e.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-white/90 px-3 py-2 text-sm text-foreground/80 shadow-ring focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-white/10"
                  >
                    <option value="">{tt("chat.pickCv")}</option>
                    {cvs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.originalFilename || c.id.slice(0, 10)}
                      </option>
                    ))}
                  </select>

                  <div className="text-xs uppercase tracking-[0.32em] text-foreground/50">
                    {tt("chat.pickJob")}
                  </div>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full rounded-2xl border border-border/60 bg-white/90 px-3 py-2 text-sm text-foreground/80 shadow-ring focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-white/10"
                  >
                    <option value="">{tt("chat.pickJob")}</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>

                  <Button2
                    onClick={run}
                    disabled={!cvId || !jobId || loading}
                    className="w-full bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground shadow-soft hover:brightness-110"
                  >
                    {loading ? (
                      <Loader22 className="me-2 animate-spin" />
                    ) : (
                      <Play2 className="me-2" size={16} />
                    )}{" "}
                    {loading ? tt("chat.running") : tt("chat.run")}
                  </Button2>
                </div>

                {result && (
                  <motion2.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 rounded-2xl border border-border/50 bg-white/90 p-4 shadow-sm backdrop-blur dark:bg-white/10"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]">
                      <div className="grid place-items-center">
                        <ScoreGauge value={Number(result.score || 0)} />
                      </div>
                      <div>
                        <div className="mb-1 font-semibold text-foreground">
                          {tt("chat.score")} • {Number(result.score || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-foreground/60">
                          model: {result.model} • status: {result.status}
                        </div>
                        {result.gaps && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {result.gaps.mustHaveMissing?.map((g) => (
                              <span
                                key={"m" + g}
                                className="rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                              >
                                Must: {g}
                              </span>
                            ))}
                            {result.gaps.improve?.map((g) => (
                              <span
                                key={"i" + g}
                                className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                              >
                                Improve: {g}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {Array.isArray(result.breakdown) && (
                      <div className="mt-2">
                        <div className="mb-2 font-semibold">Breakdown</div>
                        <div className="max-h-64 space-y-2 overflow-auto pr-1">
                          {result.breakdown.map((r: any, idx: number) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-border/50 bg-white/80 px-3 py-2 text-sm text-foreground/80 shadow-sm dark:bg-white/10"
                            >
                              <div className="text-sm font-medium text-foreground">
                                {r.requirement}
                              </div>
                              <div className="text-xs text-foreground/60">
                                must:{r.mustHave ? "✓" : "—"} • weight:
                                {r.weight} • sim:
                                {(r.similarity * 100).toFixed(1)}% • score:
                                {Number(r.score10 || 0).toFixed(1)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion2.div>
                )}
              </div>
            </motion2.div>
          </motion2.div>
        )}
      </AnimatePresence2>
    </>
  );
}
