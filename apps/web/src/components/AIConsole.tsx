// =============================
// apps/web/src/components/AIConsole.tsx
// =============================
"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Paperclip,
  Send,
  FileText,
  Loader2,
  CheckCircle2,
  Sparkles,
  Trash2,
  Mic,
  MicOff,
  ShieldCheck,
  Info,
  Play,
  Circle,
  Plus,
  X,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Settings2,
  Wand2,
} from "lucide-react";
import { cvApi } from "@/services/api/cv";
import { jobsApi, type JobRequirement } from "@/services/api/jobs";
import { analysesApi, type Analysis } from "@/services/api/analyses";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import RequirementPicker, {
  type ReqItem,
} from "@/components/RequirementPicker";
import { Button } from "@/components/ui/Button";

// ----------------------------------------
// Helpers
// ----------------------------------------

type Msg = {
  id: string;
  role: "bot" | "user" | "sys";
  content: React.ReactNode;
};

function getLangFromStorage(): Lang {
  try {
    if (typeof window !== "undefined") {
      return (window.localStorage.getItem("lang") as Lang) || "ar";
    }
  } catch {}
  return "ar";
}

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("ar");
  useEffect(() => {
    setLang(getLangFromStorage());
    const onStorage = () => setLang(getLangFromStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return lang;
}

function parseRequirements(text: string): JobRequirement[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line
        .split(/[，,|،]/)
        .map((p) => p.trim())
        .filter(Boolean);
      const requirement = parts[0] || line;
      const mustHave = parts.some((p) => /^must/i.test(p) || /^ضروري/.test(p));
      const weightPart = parts.find((p) => /^\d+(\.\d+)?$/.test(p));
      const weight = weightPart ? Number(weightPart) : 1;
      return { requirement, mustHave, weight } as JobRequirement;
    });
}

function useAutoScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const scrollToBottom = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);
  return { ref, scrollToBottom } as const;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-xs text-foreground dark:bg-white/10">
      {children}
    </span>
  );
}

// ----------------------------------------
// AIConsole Component
// ----------------------------------------

export default function AIConsole() {
  const lang = useLang();
  const tt = (k: string) => t(lang, k);

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m0",
      role: "bot",
      content: (
        <div>
          <div className="font-semibold">{tt("chat.title")}</div>
          <div className="mt-1 text-sm opacity-80">{tt("chat.hello")}</div>
          <ul className="mt-2 list-disc ps-5 text-xs opacity-70">
            <li>
              1) اكتب المتطلبات (سطر لكل متطلب) مع must و/أو وزن (مثال: 2).
            </li>
            <li>2) ارفع الـCV (PDF/DOCX).</li>
            <li>3) اضغط {tt("chat.run")} لعرض النتيجة.</li>
          </ul>
        </div>
      ),
    },
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reqText, setReqText] = useState("");
  const [reqs, setReqs] = useState<JobRequirement[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [peekBreakdown, setPeekBreakdown] = useState(false);

  const { ref: listRef, scrollToBottom } = useAutoScroll<HTMLDivElement>();
  useEffect(() => scrollToBottom(), [messages, result, scrollToBottom]);

  const push = (m: Omit<Msg, "id">) =>
    setMessages((s) => [
      ...s,
      { ...m, id: Math.random().toString(36).slice(2) },
    ]);

  const onSendReqs = () => {
    if (!reqText.trim()) return;
    const parsed = parseRequirements(reqText);
    setReqs(parsed);
    push({
      role: "user",
      content: (
        <div>
          <div className="font-medium">Job Requirements</div>
          <ul className="mt-1 list-disc ps-5 text-sm">
            {parsed.map((r, i) => (
              <li key={i}>
                {r.requirement} {r.mustHave ? "• must" : ""}{" "}
                {r.weight !== 1 ? `• w=${r.weight}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ),
    });
    push({
      role: "bot",
      content: (
        <div className="text-sm">
          ✅ تم استلام المتطلبات. ارفع الـCV ثم اضغط {tt("chat.run")}.
        </div>
      ),
    });
    setReqText("");
  };

  const onQuickAdd = (item: ReqItem) => {
    const line = `${item.requirement}${item.mustHave ? ", must" : ""}, ${item.weight}`;
    setReqText((prev) => (prev ? `${prev}\n${line}` : line));
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    setCvFile(f);
    push({
      role: "user",
      content: (
        <div className="inline-flex items-center gap-2">
          <FileText className="size-4" />
          <span className="text-sm">{f.name}</span>
        </div>
      ),
    });
  };

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoice = () => {
    try {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      if (!SpeechRecognition)
        return alert("متصفحك لا يدعم تحويل الكلام إلى نص.");
      const rec = new SpeechRecognition();
      rec.lang = lang === "ar" ? "ar-JO" : "en-US";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (e: any) => {
        const txt = e.results?.[0]?.[0]?.transcript || "";
        if (txt) setReqText((p) => (p ? `${p}\n${txt}` : txt));
      };
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
      setListening(true);
      rec.start();
    } catch (_) {
      setListening(false);
    }
  };

  const stopVoice = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {}
    setListening(false);
  };

  const run = async () => {
    if (!cvFile || reqs.length === 0) {
      push({
        role: "bot",
        content: (
          <div className="text-sm">
            {lang === "ar"
              ? "رجاءً أدخل المتطلبات وارفع CV أولًا."
              : "Please add requirements and upload a CV first."}
          </div>
        ),
      });
      return;
    }
    setLoading(true);
    setResult(null);
    push({
      role: "user",
      content: (
        <div className="inline-flex items-center gap-2">
          <Send className="size-4" /> {tt("chat.run")}
        </div>
      ),
    });

    try {
      const job = await jobsApi.create({
        title: title || (lang === "ar" ? "وظيفة بدون عنوان" : "Untitled Job"),
        description: description || "—",
        requirements: reqs,
      });
      const uploaded = await cvApi.upload(cvFile);
      push({
        role: "sys",
        content: (
          <div
            aria-live="polite"
            className="inline-flex items-center gap-2 text-xs opacity-70"
          >
            <Loader2 className="size-4 animate-spin" /> {tt("chat.running")}
          </div>
        ),
      });
      const a = await analysesApi.run({ jobId: job.id, cvId: uploaded.cvId });
      const final = await analysesApi.get(a.id);
      setResult(final);
      push({
        role: "bot",
        content: (
          <div>
            <div className="inline-flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="size-5" /> {tt("chat.done")}
            </div>
            <div className="mt-2 text-sm">
              <b>{tt("chat.score")}</b>:{" "}
              {typeof final.score === "number" ? final.score.toFixed(2) : "-"} /
              10
            </div>
            {Array.isArray(final.breakdown) && (
              <div className="mt-3 max-h-56 overflow-auto rounded-2xl border border-black/10 dark:border-white/10">
                <table className="w-full text-xs">
                  <thead className="bg-black/5 dark:bg-white/10">
                    <tr>
                      <th className="p-2 text-start">Requirement</th>
                      <th className="p-2">Must</th>
                      <th className="p-2">W</th>
                      <th className="p-2">Sim%</th>
                      <th className="p-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {final.breakdown.map((r: any, i: number) => (
                      <tr
                        key={i}
                        className="border-t border-black/10 dark:border-white/10"
                      >
                        <td className="p-2">{r.requirement}</td>
                        <td className="p-2 text-center">
                          {r.mustHave ? "✓" : "—"}
                        </td>
                        <td className="p-2 text-center">{r.weight}</td>
                        <td className="p-2 text-center">
                          {(r.similarity * 100).toFixed(1)}%
                        </td>
                        <td className="p-2 text-center">
                          {r.score10?.toFixed?.(2) ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {final.gaps && (
              <div className="mt-3 space-y-1 text-xs opacity-80">
                <div>
                  <b>{tt("chat.gaps")}</b>
                </div>
                <div>
                  must-missing: {final.gaps.mustHaveMissing?.join(", ") || "—"}
                </div>
                <div>improve: {final.gaps.improve?.join(", ") || "—"}</div>
              </div>
            )}
          </div>
        ),
      });
    } catch (e: any) {
      push({
        role: "bot",
        content: (
          <div className="text-sm text-red-600">
            Error: {e?.message || "failed"}
          </div>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  // Motion background blobs
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotate = useTransform(mx, [0, 1], [0, 6]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white/70 p-4 shadow-xl dark:border-white/10 dark:bg-white/5">
        {/* Animated blobs */}
        <motion.div
          style={{ rotate }}
          className="pointer-events-none absolute -left-24 -top-24 -z-10 size-72 rounded-full bg-blue-200/40 blur-3xl"
        />
        <motion.div
          style={{ rotate }}
          className="pointer-events-none absolute -bottom-24 -right-24 -z-10 size-72 rounded-full bg-purple-200/40 blur-3xl"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-2 pb-3">
          <div className="inline-flex items-center gap-2 font-semibold">
            <Sparkles className="size-4" /> AI • {t(lang, "app")}
          </div>
          <div className="flex items-center gap-2 text-xs opacity-60">
            <Chip>
              <ShieldCheck className="size-3" /> Privacy-first
            </Chip>
            <Chip>
              <Info className="size-3" /> Beta
            </Chip>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          className="max-h-[55vh] space-y-2 overflow-y-auto pe-1"
          aria-live="polite"
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={
                  m.role === "user"
                    ? "ms-auto max-w-[85%] rounded-2xl bg-blue-600 px-3 py-2 text-white shadow"
                    : m.role === "sys"
                      ? "mx-auto max-w-[85%] rounded-2xl bg-black/5 px-3 py-2 text-xs dark:bg-white/10"
                      : "me-auto max-w-[85%] rounded-2xl bg-white/80 px-3 py-2 shadow dark:bg-white/10"
                }
              >
                {m.content}
              </motion.div>
            ))}
          </AnimatePresence>

          {result && (
            <div className="me-auto max-w-[85%] rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-700 dark:bg-emerald-900/20">
              <div className="text-sm">
                <b>{tt("chat.score")}:</b> {result.score?.toFixed?.(2) ?? "-"} /
                10
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.gaps?.mustHaveMissing?.map((g) => (
                  <Chip key={"m" + g}>Must: {g}</Chip>
                ))}
                {result.gaps?.improve?.map((g) => (
                  <Chip key={"i" + g}>Improve: {g}</Chip>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Control */}
        <div className="mt-3 grid gap-2">
          {/* Title / Desc */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              placeholder={
                lang === "ar" ? "Job Title (اختياري)" : "Job Title (optional)"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border bg-white/90 px-3 py-2 dark:bg-white/10"
            />
            <input
              placeholder={
                lang === "ar"
                  ? "Job Description (اختياري)"
                  : "Job Description (optional)"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border bg-white/90 px-3 py-2 dark:bg-white/10"
            />
          </div>

          {/* Requirements */}
          <div className="rounded-2xl border bg-white/60 p-2 dark:bg-white/10">
            <div className="mb-1 text-xs opacity-70">
              {lang === "ar"
                ? "Requirements (سطر لكل متطلب، اكتب must/وزن اختياريًا)"
                : "Requirements (one per line, you can add 'must' and/or a weight)"}
            </div>

            <div className="mb-2">
              <RequirementPicker onAdd={onQuickAdd} />
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <textarea
                value={reqText}
                onChange={(e) => setReqText(e.target.value)}
                rows={4}
                placeholder={
                  lang === "ar"
                    ? `مثال:\nReact, must, 2\nTypeScript, 1\nTailwind`
                    : `Example:\nReact, must, 2\nTypeScript, 1\nTailwind`
                }
                className="w-full rounded-xl border bg-white/90 px-3 py-2 dark:bg-white/10"
              />
              <div className="flex items-start gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSendReqs}
                  className="whitespace-nowrap"
                >
                  {lang === "ar" ? "أضف المتطلبات" : "Add Requirements"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setReqText("")}
                >
                  {lang === "ar" ? "مسح" : "Clear"}
                </Button>
              </div>
            </div>

            {/* Recorded requirements preview */}
            {reqs.length > 0 && (
              <div className="mt-2 rounded-xl border bg-white/70 p-2 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold opacity-70">
                    Requirements ({reqs.length})
                  </div>
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
                  >
                    {expanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}{" "}
                    تفاصيل
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                        {reqs.map((r, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between rounded-lg border px-2 py-1 text-xs"
                          >
                            <span className="truncate">
                              {r.requirement}
                              {r.mustHave && (
                                <span className="ms-2 rounded bg-rose-100 px-1 py-0.5 text-[10px] text-rose-700">
                                  must
                                </span>
                              )}
                              {r.weight !== 1 && (
                                <span className="ms-2 rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-700">
                                  w={r.weight}
                                </span>
                              )}
                            </span>
                            <button
                              onClick={() =>
                                setReqs((prev) =>
                                  prev.filter((_, idx) => idx !== i)
                                )
                              }
                              className="text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Voice add */}
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={listening ? stopVoice : startVoice}
                    className={
                      listening
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : ""
                    }
                  >
                    {listening ? (
                      <MicOff className="me-2 size-4" />
                    ) : (
                      <Mic className="me-2 size-4" />
                    )}{" "}
                    {listening
                      ? lang === "ar"
                        ? "إيقاف الإملاء"
                        : "Stop Dictation"
                      : lang === "ar"
                        ? "إضافة صوتية"
                        : "Voice Add"}
                  </Button>
                  <div className="text-xs opacity-60">
                    تحويل الكلام إلى نص لتعبئة المتطلبات سريعًا
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <label
                htmlFor="cvfile"
                className="inline-flex cursor-pointer items-center gap-2 text-sm"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-black text-white">
                  <Paperclip className="size-4" />
                </span>
                <input
                  id="cvfile"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={onPickFile}
                  className="hidden"
                />
                <span className="opacity-80">
                  {cvFile
                    ? cvFile.name
                    : lang === "ar"
                      ? "أرفق CV (PDF/DOCX)"
                      : "Attach CV (PDF/DOCX)"}
                </span>
              </label>

              <div className="flex items-center gap-2">
                <Button onClick={run} disabled={loading}>
                  {loading ? (
                    <Loader2 className="me-2 size-4 animate-spin" />
                  ) : (
                    <Send className="me-2 size-4" />
                  )}
                  {loading
                    ? lang === "ar"
                      ? "جاري العمل…"
                      : "Working…"
                    : tt("chat.run")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs opacity-60">
        Next.js • Tailwind • Motion
      </div>
    </div>
  );
}
