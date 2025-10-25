import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

type Role = "system" | "user" | "assistant";

type IncomingMessage = {
  role: Role;
  content: string;
};

type RequestBody = {
  messages?: IncomingMessage[];
  lang?: string;
  intent?: string;
  context?: Record<string, unknown>;
};

export async function POST(req: Request) {
  if (!openai) {
    return new Response("Missing OpenAI configuration", { status: 500 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  if (incoming.length === 0) {
    return new Response("No messages provided", { status: 400 });
  }

  const normalized: IncomingMessage[] = incoming
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : message.role === "system" ? "system" : "user",
      content: typeof message.content === "string" ? message.content : "",
    }))
    .filter((message) => message.content.trim().length > 0)
    .slice(-12);

  if (!normalized.some((message) => message.role === "system")) {
    normalized.unshift({
      role: "system",
      content:
        body.lang === "ar"
          ? "أجب بإيجاز وبنبرة مهنية مشجعة مع خطوات عملية عند الإمكان."
          : "Respond succinctly with a warm, professional tone and actionable next steps when possible.",
    });
  }

  if (body.context && typeof body.context === "object") {
    const contextText = Object.entries(body.context)
      .map(([key, value]) => {
        if (value == null) return `${key}: —`;
        if (typeof value === "string") return `${key}: ${value}`;
        try {
          return `${key}: ${JSON.stringify(value)}`;
        } catch {
          return `${key}: ${String(value)}`;
        }
      })
      .join("\n");
    normalized.splice(1, 0, {
      role: "system",
      content: `${body.lang === "ar" ? "معلومات سياقية" : "Context"}::\n${contextText}`,
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: normalized,
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const iterator = completion[Symbol.asyncIterator]();

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { value, done } = await iterator.next();
          if (done) {
            controller.close();
            return;
          }
          const chunk = value.choices?.[0]?.delta?.content;
          if (chunk) controller.enqueue(encoder.encode(chunk));
        } catch (error) {
          controller.error(error);
        }
      },
      async cancel() {
        await iterator.return?.();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("/api/chat error", error);
    const message =
      typeof error?.message === "string" ? error.message : "Failed to generate response";
    return new Response(message, { status: 500 });
  }
}
