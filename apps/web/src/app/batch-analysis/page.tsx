"use client";

import { useEffect, useRef, useState } from "react";

type CV = { id: string; filename?: string; url?: string };
type Job = { id: string; title: string };

export default function BatchAnalysisPage() {
  // Job form
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobId, setJobId] = useState<string>("");

  // CVs
  const [allCvs, setAllCvs] = useState<CV[]>([]);
  const [selectedCvIds, setSelectedCvIds] = useState<string[]>([]);
  const [limit, setLimit] = useState(50);

  // Results
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // === Helpers ===
  const fetchJson = async (url: string, opts?: RequestInit) => {
    const r = await fetch(url, opts);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "Request failed");
    return j;
  };

  // 1) تحميل قائمة CVs الموجودة
  async function loadCvs() {
    try {
      const data = await fetchJson("/api/cv"); // تأكد أن routes ترجع [{id, filename, url}]
      setAllCvs(data?.items || data || []);
    } catch (e) {
      console.error(e);
    }
  }

  // 2) إنشاء Job من JD
  async function createJob() {
    if (!jobTitle || !jobDescription) {
      alert("أدخل العنوان والوصف أولًا");
      return;
    }
    setLoading(true);
    try {
      const data = await fetchJson("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: jobTitle, description: jobDescription }),
      });
      setJobId(data?.id || data?.job?.id || "");
      if (!data?.id && !data?.job?.id) {
        alert("لم يتم استرجاع jobId — تأكد من استجابة /api/jobs");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  // 3) رفع CV جديد (يتخزن في Supabase عبر السيرفر)
  async function uploadCv(file: File) {
    const fd = new FormData();
    fd.append("file", file); // لازم اسم الحقل يطابق اللي في باك-إندك
    setLoading(true);
    try {
      const data = await fetchJson("/api/cv/upload", {
        method: "POST",
        body: fd,
      });
      // نتوقّع يرجع { id, filename, url }
      await loadCvs();
      // أضفه تلقائيًا للـselected
      if (data?.id)
        setSelectedCvIds((prev) => Array.from(new Set([...prev, data.id])));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // 4) تشغيل التحليل الجماعي
  async function runBatch() {
    if (!jobId) return alert("أنشئ الوظيفة أولًا");
    if (selectedCvIds.length === 0) return alert("اختر CVs أولًا");
    setLoading(true);
    try {
      const payload = {
        jobId,
        cvIds: selectedCvIds.slice(0, limit),
        topK: 3,
        strictMust: true,
      };
      const data = await fetchJson("/api/analyses/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setResult(data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(cvId: string) {
    setSelectedCvIds((prev) =>
      prev.includes(cvId)
        ? prev.filter((x) => x !== cvId)
        : prev.length < limit
          ? [...prev, cvId]
          : prev
    );
  }

  useEffect(() => {
    loadCvs();
  }, []);

  // ==== UI ====
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff9f5] to-[#ffe7d0] py-12">
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        {/* العنوان */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-orange-600">
            تحليل مجموعة CVs
          </h1>
          <p className="text-sm text-foreground/70 mt-2">
            اختر وظيفة واحدة ثم حتى 50 CV — اضغط بدء التحليل لعرض أفضل 3 مع
            الأسباب وجدول مفصّل.
          </p>
        </div>

        {/* Job Section */}
        <section className="rounded-3xl bg-white/80 border border-orange-100 shadow-soft p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-orange-700">الوظيفة</h2>
            {jobId && (
              <span className="text-xs text-green-600">
                تم الإنشاء • ID: {jobId}
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="العنوان (مثال: مهندس برمجيات)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full p-3 border border-orange-200 rounded-2xl text-right placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <textarea
            placeholder="الوصف/Job Description (يمكن لصقه هنا لاستخراج المتطلبات في الباك-إند)"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-28 p-3 border border-orange-200 rounded-2xl text-right placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={createJob}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-amber-400 text-white px-5 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "..." : "إنشاء الوظيفة"}
            </button>
            {/* تستطيع إضافة زر "اقتراح المتطلبات" إن عندك endpoint منفصل */}
          </div>
        </section>

        {/* CVs Section */}
        <section className="rounded-3xl bg-white/80 border border-orange-100 shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-orange-700">
              السير الذاتية (حتى {limit})
            </h2>
            <span className="text-xs text-foreground/60">
              المختار: {selectedCvIds.length} / {limit}
            </span>
          </div>

          {/* رفع CV */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.rtf"
              onChange={(e) =>
                e.target.files?.[0] && uploadCv(e.target.files[0])
              }
              className="w-full rounded-xl border border-orange-200 bg-white/70 p-2 text-sm"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50"
              type="button"
            >
              إضافة
            </button>
          </div>

          {/* اختيار من الموجود */}
          <div className="grid md:grid-cols-2 gap-2">
            {allCvs.map((cv) => {
              const selected = selectedCvIds.includes(cv.id);
              return (
                <button
                  key={cv.id}
                  onClick={() => toggleSelect(cv.id)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-right transition ${
                    selected
                      ? "border-amber-400 bg-amber-50"
                      : "border-orange-200 hover:bg-orange-50"
                  }`}
                  type="button"
                >
                  <div className="flex-1">
                    <div className="font-medium">{cv.filename || cv.id}</div>
                    {cv.url && (
                      <div className="text-xs text-gray-500 truncate">
                        {cv.url}
                      </div>
                    )}
                  </div>
                  <span className="text-xs">
                    {selected ? "✓ مختار" : "اختر"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chips للـCVs المختارة */}
          {selectedCvIds.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedCvIds.map((id) => {
                const label = allCvs.find((c) => c.id === id)?.filename || id;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-800 px-3 py-1 text-xs"
                  >
                    {label}
                    <button
                      onClick={() => toggleSelect(id)}
                      className="rounded-full bg-orange-200 px-2 py-0.5 text-[10px] hover:bg-orange-300"
                    >
                      إزالة
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={runBatch}
              disabled={loading || !jobId || selectedCvIds.length === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white py-3 rounded-2xl text-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "جاري التحليل..." : "بدء التحليل الجماعي"}
            </button>
          </div>
        </section>

        {/* النتائج */}
        {result && (
          <section className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-orange-700 text-center">
                أفضل {result.top.length} مرشحين
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {result.top.map((t: any) => (
                  <div
                    key={t.cvId}
                    className="p-4 rounded-2xl bg-white/80 border border-orange-100 shadow"
                  >
                    <div className="font-bold text-orange-700">
                      #{t.rank} — {t.cvId}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      Score: <b>{t.score}</b>
                    </div>
                    <div className="text-[13px] text-gray-600 mt-2 leading-relaxed">
                      {t.why}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto bg-white/70 border border-orange-100 rounded-2xl p-4 shadow">
              <table className="w-full text-sm text-right">
                <thead className="text-orange-700 border-b border-orange-200">
                  <tr>
                    <th className="p-2">CV</th>
                    <th className="p-2">Score</th>
                    <th className="p-2">الحالة</th>
                    <th className="p-2">Must Missing</th>
                    <th className="p-2">Improve</th>
                  </tr>
                </thead>
                <tbody>
                  {result.summaryTable.map((r: any) => (
                    <tr key={r.cvId} className="border-b border-orange-50">
                      <td className="p-2">{r.cvId}</td>
                      <td className="p-2">{r.score}</td>
                      <td className="p-2">{r.status}</td>
                      <td className="p-2 text-red-500">
                        {r.mustMiss?.join(", ") || "-"}
                      </td>
                      <td className="p-2 text-amber-700">
                        {r.improve?.join(", ") || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-center text-gray-500 text-sm mt-3">
                {result.tieBreakNotes}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
