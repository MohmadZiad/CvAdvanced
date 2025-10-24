"use client";
import { useMemo, useState } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { motion } from "framer-motion";
import { BadgeCheck, Flame } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ReqItem = {
  requirement: string;
  mustHave: boolean;
  weight: number;
};

const IT_WORDS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Express",
  "NestJS",
  "GraphQL",
  "REST",
  "Tailwind CSS",
  "Sass",
  "CSS3",
  "HTML5",
  "Vite",
  "Webpack",
  "Babel",
  "Redux",
  "Zustand",
  "TanStack Query",
  "RxJS",
  "Jest",
  "Vitest",
  "Playwright",
  "Cypress",
  "Testing Library",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "Prisma",
  "TypeORM",
  "Drizzle",
  "Redis",
  "ElasticSearch",
  "Kafka",
  "RabbitMQ",
  "AWS",
  "GCP",
  "Azure",
  "Cloudflare",
  "Vercel",
  "Netlify",
  "Docker",
  "Kubernetes",
  "Terraform",
  "CI/CD",
  "GitHub Actions",
  "GitLab CI",
  "CircleCI",
  "Authentication",
  "OAuth2",
  "JWT",
  "SAML",
  "OpenID Connect",
  "Security",
  "OWASP",
  "ZAP",
  "Snyk",
  "SonarQube",
  "WebSockets",
  "Socket.io",
  "gRPC",
  "tRPC",
  "Microservices",
  "Event-driven",
  "DDD",
  "Clean Architecture",
  "SOLID",
  "Performance",
  "Caching",
  "CDN",
  "SSR",
  "SSG",
  "ISR",
  "i18n",
  "RTL",
  "Accessibility",
  "SEO",
  "Analytics",
  "Python",
  "Django",
  "Flask",
  "FastAPI",
  "Go",
  "Rust",
  "C#",
  ".NET",
  "Java",
  "Spring Boot",
  "Kotlin",
  "Agile",
  "Scrum",
  "Kanban",
  "Jira",
  "Confluence",
  "AI",
  "LLM",
  "Prompt Engineering",
  "RAG",
  "Embeddings",
  "Vector DB",
  "pgvector",
  "OpenAI API",
  "LangChain",
  "Whisper",
  "Vision",
  "Mobile",
  "React Native",
  "Expo",
  "PWA",
  "Design Systems",
  "Storybook",
  "Figma",
  "Shadcn UI",
  "Radix UI",
  "Logging",
  "Observability",
  "OpenTelemetry",
  "Sentry",
  "Datadog",
];

type Props = {
  onAdd: (item: ReqItem) => void;
};

const WEIGHTS = [
  { value: 1, label: "w1", description: "أولوية عادية" },
  { value: 2, label: "w2", description: "أولوية متقدمة" },
  { value: 3, label: "w3", description: "حرج للوظيفة" },
];

export default function RequirementPicker({ onAdd }: Props) {
  const [q, setQ] = useState("");
  const [must, setMust] = useState(true);
  const [weight, setWeight] = useState(1);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? IT_WORDS.filter((w) => w.toLowerCase().includes(s)) : IT_WORDS.slice(0, 28);
  }, [q]);

  return (
    <div className="surface">
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Library</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">
            متطلبات جاهزة للوظائف التقنية
          </h3>
        </div>
        <span className="tag">
          <Flame size={14} /> Top Skills
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن React، DevOps…"
          className="h-11 rounded-xl bg-white/90 dark:bg-white/10"
        />

        <label className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-white/80 px-3 py-2 text-xs font-medium text-foreground/70 shadow-sm transition hover:border-border hover:bg-white dark:bg-white/10">
          <input
            type="checkbox"
            checked={must}
            onChange={(e) => setMust(e.target.checked)}
            className="size-4 rounded border border-border/40 accent-primary"
          />
          must
        </label>

        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-white/80 px-3 py-2 shadow-sm dark:bg-white/10">
          {WEIGHTS.map((w) => (
            <Button
              key={w.value}
              variant={w.value === weight ? "primary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 rounded-lg px-3 text-[11px] uppercase tracking-[0.3em]",
                w.value === weight ? "shadow-soft" : "text-foreground/60",
              )}
              onClick={() => setWeight(w.value)}
            >
              {w.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea.Root className="mt-5 h-48 w-full overflow-hidden rounded-2xl border border-border/50 bg-white/70 shadow-inner dark:bg-white/5">
        <ScrollArea.Viewport className="h-full w-full p-3">
          <div className="grid grid-cols-2 gap-2">
            {list.map((item) => (
              <motion.button
                key={item}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAdd({ requirement: item, mustHave: must, weight })}
                className="group flex h-[58px] flex-col justify-center rounded-xl border border-border/50 bg-white/90 px-3 text-start text-xs font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 dark:bg-white/10"
              >
                <span>{item}</span>
                <span className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                  <BadgeCheck size={12} /> {must ? "Must" : "Nice"} • {WEIGHTS.find((w) => w.value === weight)?.label}
                </span>
              </motion.button>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="flex touch-none select-none bg-transparent p-1"
        >
          <ScrollArea.Thumb className="flex-1 rounded-full bg-gradient-to-b from-primary/60 to-secondary/60" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <p className="mt-4 text-[11px] text-foreground/50">
        اضغط على أي مهارة لإضافتها مباشرة إلى متطلبات الوظيفة. سيتم حفظ حالة must والوزن الحالية.
      </p>
    </div>
  );
}
