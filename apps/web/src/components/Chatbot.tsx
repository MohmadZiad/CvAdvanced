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
        className="fixed bottom-5 end-5 z-[60] grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-black to-stone-800 text-white shadow-xl transition hover:scale-105"
        aria-label="Open Assistant"
      >
        <MessageCircle />
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
              className="absolute bottom-0 end-0 m-5 w-[min(480px,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-2xl dark:bg-black/70"
            >
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
                <div className="text-sm font-semibold">{tt("chat.title")}</div>
                <button
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X2 size={18} />
                </button>
              </div>

              <div className="max-h-[70vh] space-y-3 overflow-auto p-3">
                {msgs.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ms-auto max-w-[85%] rounded-2xl bg-blue-600 px-3 py-2 text-white shadow"
                        : m.role === "sys"
                          ? "mx-auto max-w-[85%] rounded-2xl bg-black/5 px-3 py-2 text-xs dark:bg-white/10"
                          : "me-auto max-w-[85%] rounded-2xl bg-white/70 px-3 py-2 shadow dark:bg-white/10"
                    }
                  >
                    {m.text}
                  </div>
                ))}

                <div className="backdrop-blur rounded-2xl border p-3 dark:bg-white/5">
                  <div className="mb-2 text-sm font-semibold">
                    Job Description (اختياري)
                  </div>
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    className="min-h-[120px] w-full rounded-xl border bg-white/70 px-3 py-2 dark:bg-white/5"
                    placeholder="ألصق وصف الوظيفة هنا ثم اطلب من الذكاء توليد المتطلبات"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button2
                      onClick={handleSuggest}
                      disabled={!jd.trim() || suggesting}
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

                <div className="backdrop-blur space-y-2 rounded-2xl border p-3 dark:bg-white/5">
                  <div className="text-xs opacity-70">{tt("chat.pickCv")}</div>
                  <select
                    value={cvId}
                    onChange={(e) => setCvId(e.target.value)}
                    className="w-full rounded-xl border bg-white/70 px-3 py-2 dark:bg-white/5"
                  >
                    <option value="">{tt("chat.pickCv")}</option>
                    {cvs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.originalFilename || c.id.slice(0, 10)}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 text-xs opacity-70">
                    {tt("chat.pickJob")}
                  </div>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full rounded-xl border bg-white/70 px-3 py-2 dark:bg-white/5"
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
                    className="mt-2 w-full"
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
                    className="backdrop-blur space-y-3 rounded-2xl border p-3 dark:bg-white/5"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]">
                      <div className="grid place-items-center">
                        <ScoreGauge value={Number(result.score || 0)} />
                      </div>
                      <div>
                        <div className="mb-1 font-semibold">
                          {tt("chat.score")} •{" "}
                          {Number(result.score || 0).toFixed(2)}
                        </div>
                        <div className="text-xs opacity-70">
                          model: {result.model} • status: {result.status}
                        </div>
                        {result.gaps && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {result.gaps.mustHaveMissing?.map((g) => (
                              <span
                                key={"m" + g}
                                className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                              >
                                Must: {g}
                              </span>
                            ))}
                            {result.gaps.improve?.map((g) => (
                              <span
                                key={"i" + g}
                                className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
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
                              className="rounded-xl border bg-white/60 px-3 py-2 dark:bg-white/10"
                            >
                              <div className="text-sm font-medium">
                                {r.requirement}
                              </div>
                              <div className="text-xs opacity-70">
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
