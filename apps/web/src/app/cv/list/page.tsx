"use client";
import * as React from "react";
import { cvApi, type CV, buildPublicUrl } from "@/services/api/cv";
import { Button } from "@/components/ui/Button";

export default function CVList() {
  const [items, setItems] = React.useState<CV[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    cvApi
      .list()
      .then((r) => setItems(r.items))
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold">قائمة السير الذاتية</h1>

      {loading ? (
        <div className="rounded-xl border p-6 text-center">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد ملفات بعد. ارفع أول CV من صفحة الرفع.
        </div>
      ) : (
        <ul className="divide-y rounded-2xl border bg-white/50 shadow-sm backdrop-blur">
          {items.map((i) => {
            const publicUrl = buildPublicUrl(i);
            const created = i.createdAt
              ? new Date(i.createdAt).toLocaleString()
              : "—";
            return (
              <li key={i.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{i.id.slice(0, 8)}…</span>
                  <span className="text-sm text-muted-foreground">
                    {i.originalFilename || "بدون اسم"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {publicUrl && (
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline"
                    >
                      عرض الملف
                    </a>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {created}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(i.id).catch(() => {});
                    }}
                  >
                    نسخ المعرّف
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
