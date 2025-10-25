"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLang } from "@/components/ui/theme-provider";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { Lang } from "@/components/ui/theme-provider";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
};

type Suggestion = { label: string; prompt: string };

const SYSTEM_PROMPT: Record<Lang, string> = {
  ar: "أنت مساعد مطابقة سير ذاتية متاح باللغة العربية. كن ودودًا، عمليًا، وقدّم إجابات موجزة مدعومة بخطوات قابلة للتنفيذ. استخدم نقطًا عند الحاجة واجعل النبرة مهنية مشجعة.",
  en: "You are a CV matching copilot. Respond in a warm, professional tone with concise, actionable guidance. Use short paragraphs or bullets when helpful.",
};

const SUGGESTION_PRESETS: Record<Lang, Suggestion[]> = {
  ar: [
    {
      label: "اقترح متطلبات لهذه الوظيفة",
      prompt:
        "أحتاج إلى مسودة متطلبات للوظيفة التي أعمل عليها الآن. اصنع قائمة قصيرة من المهارات والخبرات الأساسية مرتبة بالأهمية.",
    },
    {
      label: "حلل الـCV وأعطني نقاط القوة",
      prompt:
        "حلّل السير الذاتية التي أراجعها وحدد أبرز نقاط القوة التي يمكن إبرازها أثناء المقابلة أو في بريد المتابعة.",
    },
    {
      label: "قارن الـCV مع React + TypeScript",
      prompt:
        "قارن مهارات المرشح الحالية مع متطلبات وظيفة تعتمد على React وTypeScript، واشرح الفجوات وكيف يمكن سدّها.",
    },
  ],
  en: [
    {
      label: "Draft job requirements",
      prompt:
        "Draft a concise list of job requirements for the role I am hiring for. Prioritize core technical and collaboration skills.",
    },
    {
      label: "Summarise CV strengths",
      prompt:
        "Review the candidate profile and list the top strengths I should highlight during interview debriefs.",
    },
    {
      label: "Gap check for React + TS",
      prompt:
        "Compare the candidate's experience against a React + TypeScript position. Point out gaps and suggest how to close them.",
    },
  ],
};

const INITIAL_ID = "assistant-intro";

export default function Chatbot() {
  const { lang } = useLang();
  const suggestions = React.useMemo(() => SUGGESTION_PRESETS[lang], [lang]);

  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    {
      id: INITIAL_ID,
      role: "assistant",
      content: t(lang, "chat.hello"),
    },
  ]);
  const [isStreaming, setIsStreaming] = React.useState(false);

  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const messagesRef = React.useRef<ChatMessage[]>(messages);
  const streamingRef = React.useRef(false);

  React.useEffect(() => {
    messagesRef.current = messages;
    if (!open) return;
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [messages, open]);

  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 140);
    return () => window.clearTimeout(id);
  }, [open, lang]);

  React.useEffect(() => {
    setMessages([
      {
        id: INITIAL_ID,
        role: "assistant",
        content: t(lang, "chat.hello"),
      },
    ]);
  }, [lang]);

  const appendMessage = React.useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = React.useCallback((id: string, updater: (current: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? updater(msg) : msg)));
  }, []);

  const sendMessage = React.useCallback(
    async (raw: string) => {
      const content = raw.trim();
      if (!content || streamingRef.current) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      appendMessage(userMessage);
      setInput("");

      const assistantId = crypto.randomUUID();
      appendMessage({ id: assistantId, role: "assistant", content: "", streaming: true });

      const history = [...messagesRef.current, userMessage]
        .filter((item) => item.role !== "system")
        .slice(-10)
        .map((item) => ({
          role: item.role === "assistant" ? "assistant" : "user",
          content: item.content,
        }));

      try {
        streamingRef.current = true;
        setIsStreaming(true);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang,
            intent: "chat",
            messages: [{ role: "system", content: SYSTEM_PROMPT[lang] }, ...history],
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(response.statusText || "network error");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          updateMessage(assistantId, (current) => ({
            ...current,
            content: current.content + chunk,
          }));
        }

        updateMessage(assistantId, (current) => ({ ...current, streaming: false }));
      } catch (error: any) {
        const fallback =
          lang === "ar"
            ? `حدث خطأ أثناء جلب الرد: ${error?.message || "غير معروف"}`
            : `Unable to complete the request: ${error?.message || "unknown error"}`;
        updateMessage(assistantId, (current) => ({ ...current, content: fallback, streaming: false }));
      } finally {
        streamingRef.current = false;
        setIsStreaming(false);
      }
    },
    [appendMessage, lang, updateMessage],
  );

  const handleSubmit = React.useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      void sendMessage(input);
    },
    [input, sendMessage],
  );

  const handleSuggestion = React.useCallback(
    (prompt: string) => {
      void sendMessage(prompt);
    },
    [sendMessage],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void sendMessage(input);
      }
    },
    [input, sendMessage],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 end-6 z-[60] grid size-14 place-items-center rounded-full bg-[linear-gradient(135deg,rgba(249,115,22,0.98),rgba(214,121,59,0.95))] text-primary-foreground shadow-[0_28px_60px_-32px_rgba(249,115,22,0.6)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={lang === "ar" ? "فتح المساعد" : "Open assistant"}
      >
        <MessageCircle className="size-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-end bg-black/35 backdrop-blur-sm"
          >
            <div className="absolute inset-0" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              className="relative m-6 w-[min(520px,calc(100vw-3rem))] overflow-hidden rounded-[2.25rem] border border-border/60 bg-card/90 shadow-soft backdrop-blur-xl dark:border-border/40 dark:bg-card/60"
            >
              <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/15 via-transparent to-transparent px-6 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-foreground/50">
                    {lang === "ar" ? "مساعد التحليل" : "Analysis assistant"}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{t(lang, "chat.title")}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-transparent text-foreground/70 hover:border-border hover:text-foreground"
                  aria-label={lang === "ar" ? "إغلاق" : "Close"}
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="flex h-[min(70vh,560px)] flex-col">
                <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                        message.role === "user" &&
                          "ms-auto bg-[linear-gradient(135deg,rgba(249,115,22,0.95),rgba(214,121,59,0.9))] text-primary-foreground",
                        message.role === "assistant" &&
                          "me-auto bg-card text-foreground ring-1 ring-border/50",
                        message.role === "system" &&
                          "mx-auto bg-muted/70 text-muted-foreground text-xs uppercase tracking-[0.3em]",
                      )}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed" dir="auto">
                        {message.content || (lang === "ar" ? "..." : "...")}
                      </div>
                      {message.streaming && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-foreground/40">
                          <Loader2 className="size-3 animate-spin" />
                          {lang === "ar" ? "جاري الإرسال" : "Streaming"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/50 bg-background/80 px-6 py-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {suggestions.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleSuggestion(item.prompt)}
                        disabled={isStreaming}
                        className="chip whitespace-nowrap text-xs transition disabled:opacity-50"
                      >
                        <Sparkles className="size-3" /> {item.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <div className="relative flex-1">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={3}
                        dir="auto"
                        placeholder={
                          lang === "ar"
                            ? "اكتب سؤالك أو الصق وصف الوظيفة..."
                            : "Ask something or paste a job snippet..."
                        }
                        className="w-full resize-none rounded-[1.75rem] border border-border/40 bg-card/85 px-4 py-3 text-sm text-foreground/80 shadow-[0_1px_0_rgba(255,255,255,0.3),0_18px_45px_-35px_rgba(88,47,16,0.25)] transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:border-border/40 dark:bg-card/50"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!input.trim() || isStreaming}
                      className="h-12 w-12 rounded-full"
                    >
                      {isStreaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
