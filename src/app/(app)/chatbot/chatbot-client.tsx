"use client";

import { FormEvent, useMemo, useState } from "react";
import { BrainCircuit, LoaderCircle, Send, Sparkles } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatbotClientProps = {
  roleLabel: string;
  contextSummary: string;
};

const suggestedPrompts = [
  "Write a polite email asking for one extra day to submit homework.",
  "Explain Newton's three laws in simple words.",
  "Help me understand a JavaScript error step by step.",
  "Make a simple study plan for this week.",
];

export default function ChatbotClient({ roleLabel, contextSummary }: ChatbotClientProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => question.trim().length > 0 && !isLoading, [question, isLoading]);

  async function submitQuestion(prompt: string) {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmedPrompt }];
    setMessages(nextMessages);
    setQuestion("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedPrompt,
          contextSummary,
          history: nextMessages.slice(-6),
        }),
      });

      const payload = (await response.json()) as { answer?: string; error?: string };

      if (!response.ok || !payload.answer) {
        throw new Error(payload.error || "Chatbot response failed.");
      }

      setMessages((current) => [...current, { role: "assistant", content: payload.answer as string }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Chatbot could not answer right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitQuestion(question);
  }

  return (
    <div className="space-y-6">
      <section className="panel rounded-[32px] border p-6">
        <div className="mb-4 inline-flex rounded-full bg-[rgba(42,157,143,0.12)] p-3 text-[var(--accent)]">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Smart assistant chatbot</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
          This is a free rule-based assistant that can help with study questions, writing help, simple coding guidance, plans, and everyday explanations.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--ink-soft)]">
          <span className="badge badge-accent">Signed in as {roleLabel}</span>
          <span className="badge badge-warm">{contextSummary}</span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="panel rounded-[32px] border p-6">
          <h3 className="text-xl font-semibold text-slate-900">Suggested prompts</h3>
          <div className="mt-4 grid gap-3">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => submitQuestion(prompt)}
                className="rounded-3xl bg-white/80 p-4 text-left text-sm leading-6 text-slate-700 transition hover:translate-y-[-1px] hover:bg-white/90"
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <section className="panel rounded-[32px] border p-6">
          <h3 className="text-xl font-semibold text-slate-900">Ask a broad question</h3>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
            <label className="text-sm font-medium text-slate-700" htmlFor="chatbot-question">
              Your question
            </label>
            <textarea
              id="chatbot-question"
              className="textarea min-h-32"
              placeholder="Ask for an explanation, writing help, planning advice, or basic coding guidance."
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Ask assistant
              </button>
              <p className="text-sm text-[var(--ink-soft)]">Ask in English, Hindi, or a mix of both.</p>
            </div>
          </form>
          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        </section>
      </section>

      <section className="panel rounded-[32px] border p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--brand)]" />
          <h3 className="text-xl font-semibold text-slate-900">Conversation</h3>
        </div>
        <div className="mt-4 grid gap-4">
          {messages.length ? (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-3xl rounded-[28px] bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] px-5 py-4 text-sm leading-7 text-white shadow-[0_18px_30px_rgba(216,90,43,0.18)]"
                    : "max-w-3xl rounded-[28px] border border-white/60 bg-white/85 px-5 py-4 text-sm leading-7 text-slate-700"
                }
              >
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] opacity-70">
                  {message.role === "user" ? "You" : "Assistant"}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[28px] bg-white/80 p-5 text-sm leading-7 text-[var(--ink-soft)]">
              Send a question and the assistant will answer it here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
