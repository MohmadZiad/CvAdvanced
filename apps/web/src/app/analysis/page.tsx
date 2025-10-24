"use client";
import * as React from "react";
import { cvApi } from "@/services/api/cv";
import { jobsApi } from "@/services/api/jobs";
import { analysesApi } from "@/services/api/analyses";
import { Button } from "@/components/ui/Button";

export default function RunAnalysis() {
  const [cvs, setCvs] = React.useState<any[]>([]);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [cvId, setCvId] = React.useState("");
  const [jobId, setJobId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([cvApi.list(), jobsApi.list()])
      .then(([cvRes, jobRes]) => {
        setCvs(cvRes.items);
        setJobs(jobRes.items);
      })
      .catch((e) => setErr(e?.message || "Failed"));
  }, []);

  const run = async () => {
    setLoading(true);
    try {
      const a = await analysesApi.run({ jobId, cvId });
      window.location.href = `/analysis/${a.id}`;
    } catch (e: any) {
      alert(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">تشغيل التحليل</h1>
        <p className="text-sm text-muted-foreground mt-1">
          اختر سيرة ذاتية ووظيفة للمطابقة والحصول على النتيجة التفصيلية.
        </p>
      </header>

      {err && (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          {err}
        </div>
      )}

      <div className="rounded-xl border p-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">CV</label>
            <select
              value={cvId}
              onChange={(e) => setCvId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— اختر CV —</option>
              {cvs.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.id.slice(0, 8)}…
                </option>
              ))}
            </select>
            {cvs.length === 0 && (
              <p className="text-xs text-muted-foreground">
                لا توجد سير — ارفع من صفحة{" "}
                <span className="font-semibold">رفع السيرة الذاتية</span>.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Job</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— اختر وظيفة —</option>
              {jobs.map((j: any) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            {jobs.length === 0 && (
              <p className="text-xs text-muted-foreground">
                لا توجد وظائف — أنشئ واحدة من صفحة{" "}
                <span className="font-semibold">وظيفة جديدة</span>.
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button onClick={run} disabled={!cvId || !jobId} loading={loading}>
              حلّل الآن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
