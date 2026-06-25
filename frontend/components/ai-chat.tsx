"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkle, PaperPlaneTilt } from "@phosphor-icons/react";
import {
  type ChatSource,
  fetchHistory,
  getSessionId,
  streamChat,
} from "@/lib/api/chat";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  recs?: ChatSource[];
};

const CATEGORY_LABELS: Record<string, string> = {
  nuong: "Nướng",
  lau: "Lẩu",
  cafe: "Cafe",
  "bun-pho": "Bún/Phở",
  com: "Cơm",
};

const INTRO: Message = {
  id: "intro",
  role: "ai",
  text: "Xin chào! Mình là AI tư vấn ẩm thực của Gastro-AI 🍜 Bạn muốn tìm loại quán nào hôm nay?",
};

function matchPercent(source: ChatSource): number {
  if (typeof source.score === "number" && source.score > 0) {
    return Math.min(99, Math.max(60, Math.round(source.score * 100)));
  }
  return 90;
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([INTRO]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<string>("");

  // Load persisted history on mount
  useEffect(() => {
    sessionRef.current = getSessionId();
    fetchHistory(sessionRef.current).then((history) => {
      if (history.length === 0) return;
      setMessages(
        history.map((m, i) => ({
          id: `h-${i}`,
          role: m.role === "user" ? "user" : "ai",
          text: m.content,
          recs: m.sources,
        })),
      );
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || thinking || streaming) return;

      const aiId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", text },
        { id: aiId, role: "ai", text: "" },
      ]);
      setInput("");
      setThinking(true);

      const update = (fn: (m: Message) => Message) =>
        setMessages((prev) => prev.map((m) => (m.id === aiId ? fn(m) : m)));

      await streamChat(sessionRef.current, text, {
        onToken: (token) => {
          setThinking(false);
          setStreaming(true);
          update((m) => ({ ...m, text: m.text + token }));
        },
        onSources: (sources) => {
          update((m) => ({ ...m, recs: sources }));
        },
        onError: (message) => {
          setThinking(false);
          setStreaming(false);
          update((m) => ({ ...m, text: message }));
        },
        onDone: () => {
          setThinking(false);
          setStreaming(false);
        },
      });
    },
    [input, thinking, streaming],
  );

  const busy = thinking || streaming;

  return (
    <div className="chat-pane">
      <div className="chat-messages">
        {messages.map((msg) => {
          // Skip the assistant placeholder while it has no content yet —
          // the thinking indicator below already represents that state.
          if (msg.role === "ai" && !msg.text && !(msg.recs && msg.recs.length)) {
            return null;
          }
          return (
          <div
            key={msg.id}
            className={`chat-row${msg.role === "user" ? " user" : ""}`}
          >
            {msg.role === "ai" && (
              <div className="chat-avatar">
                <Sparkle size={13} weight="fill" />
              </div>
            )}
            <div className={`chat-bubble ${msg.role}`}>
              {msg.text && <p>{msg.text}</p>}
              {msg.recs && msg.recs.length > 0 && (
                <div className="chat-recs">
                  {msg.recs.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/${r.slug}`}
                      className="chat-rec-card"
                    >
                      <div className="chat-rec-info">
                        <span className="chat-rec-name">{r.name}</span>
                        <span className="chat-rec-meta">
                          {(r.category && CATEGORY_LABELS[r.category]) ??
                            r.category}{" "}
                          · {r.district}
                        </span>
                      </div>
                      <span className="chat-rec-match">{matchPercent(r)}%</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          );
        })}

        {thinking && (
          <div className="chat-row">
            <div className="chat-avatar">
              <Sparkle size={13} weight="fill" />
            </div>
            <div className="chat-bubble ai chat-thinking">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi AI về quán ăn, cafe..."
          disabled={busy}
          autoComplete="off"
        />
        <button type="submit" disabled={!input.trim() || busy}>
          <PaperPlaneTilt size={16} weight="fill" />
        </button>
      </form>
    </div>
  );
}
