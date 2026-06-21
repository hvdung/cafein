"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Sparkle, PaperPlaneTilt } from "@phosphor-icons/react";
import type { Restaurant } from "@/lib/mock-data";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  recs?: Restaurant[];
};

function mockAiReply(
  input: string,
  all: Restaurant[],
): { text: string; recs: Restaurant[] } {
  const q = input.toLowerCase();
  let pool = [...all].sort((a, b) => b.aiMatch - a.aiMatch);

  if (/cafe|cà phê|coffee|cozy|làm việc|work/.test(q)) {
    pool = pool.filter((r) => r.category === "cafe");
  } else if (/nướng|bbq|thịt|nuong/.test(q)) {
    pool = pool.filter((r) => r.category === "nuong");
  } else if (/phở|bún|pho|bun|súp/.test(q)) {
    pool = pool.filter((r) => r.category === "bun-pho");
  } else if (/lẩu|hot pot/.test(q)) {
    pool = pool.filter((r) => r.category === "lau");
  } else if (/cơm|rice/.test(q)) {
    pool = pool.filter((r) => r.category === "com");
  } else if (/rẻ|tiết kiệm|sinh viên|bình dân|giá rẻ|cheap/.test(q)) {
    pool = pool.filter((r) => r.priceRange === 1);
  } else if (/đang mở|mở cửa|open now/.test(q)) {
    pool = pool.filter((r) => r.isOpenNow);
  }

  const recs = pool.slice(0, 3);

  if (recs.length === 0) {
    return {
      text: "Mình chưa tìm thấy quán phù hợp. Bạn thử mô tả thêm — loại món, khu vực, hay ngân sách dự kiến?",
      recs: [],
    };
  }

  const intro =
    recs.length === 1
      ? `Mình nghĩ bạn sẽ thích **${recs[0].name}**!`
      : `Đây là ${recs.length} gợi ý phù hợp nhất mình tìm được:`;

  return { text: intro, recs };
}

export function AiChat({ restaurants }: { restaurants: Restaurant[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "ai",
      text: "Xin chào! Mình là AI tư vấn ẩm thực của Gastro-AI 🍜 Bạn muốn tìm loại quán nào hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text },
    ]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const { text: aiText, recs } = mockAiReply(text, restaurants);
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: "ai", text: aiText, recs },
      ]);
      setThinking(false);
    }, 750);
  }

  return (
    <div className="chat-pane">
      <div className="chat-messages">
        {messages.map((msg) => (
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
              <p>{msg.text}</p>
              {msg.recs && msg.recs.length > 0 && (
                <div className="chat-recs">
                  {msg.recs.map((r) => (
                    <Link key={r.id} href={`/${r.slug}`} className="chat-rec-card">
                      <div className="chat-rec-info">
                        <span className="chat-rec-name">{r.name}</span>
                        <span className="chat-rec-meta">
                          {r.categoryLabel} · {r.district}
                        </span>
                      </div>
                      <span className="chat-rec-match">{r.aiMatch}%</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

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
          disabled={thinking}
          autoComplete="off"
        />
        <button type="submit" disabled={!input.trim() || thinking}>
          <PaperPlaneTilt size={16} weight="fill" />
        </button>
      </form>
    </div>
  );
}
