"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Sparkle,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
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

export function RightPanel({ restaurants }: { restaurants: Restaurant[] }) {
  const [tab, setTab] = useState<"map" | "chat">("map");
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
    if (tab === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, tab]);

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
    <div className="right-panel">
      {/* Tab bar */}
      <div className="right-panel-tabs">
        <button
          className={`right-panel-tab${tab === "map" ? " active" : ""}`}
          onClick={() => setTab("map")}
        >
          <MapPin size={15} weight={tab === "map" ? "fill" : "regular"} />
          Vị trí
        </button>
        <button
          className={`right-panel-tab${tab === "chat" ? " active" : ""}`}
          onClick={() => setTab("chat")}
        >
          <Sparkle size={15} weight={tab === "chat" ? "fill" : "regular"} />
          AI Trợ lý
        </button>
      </div>

      {/* Map / History tab */}
      {tab === "map" && (
        <div className="map-pane-body">
          <div className="map-bg-grid" />
          <div className="map-road-h" style={{ top: "30%" }} />
          <div className="map-road-h" style={{ top: "62%" }} />
          <div className="map-road-v" style={{ left: "36%" }} />
          <div className="map-road-v" style={{ left: "68%" }} />
          <span
            className="map-label"
            style={{
              top: "28%",
              left: "38%",
              transform: "translateY(-100%)",
            }}
          >
            Lê Lợi
          </span>
          <span
            className="map-label"
            style={{
              top: "60%",
              left: "70%",
              transform: "translateY(-100%)",
            }}
          >
            Võ Văn Tần
          </span>
          {restaurants.slice(0, 5).map((item, index) => (
            <Link
              key={item.id}
              href={`/${item.slug}`}
              className="map-marker"
              style={{
                left: `${20 + (index % 3) * 24}%`,
                top: `${28 + Math.floor(index / 3) * 30 + (index % 2) * 12}%`,
              }}
            >
              {item.name}
            </Link>
          ))}
          <div className="map-attribution">
            <MapPin
              size={11}
              weight="fill"
              style={{ display: "inline", marginRight: 4 }}
            />
            Google Maps tích hợp sắp ra mắt
          </div>
        </div>
      )}

      {/* AI chat tab */}
      {tab === "chat" && (
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
                        <Link
                          key={r.id}
                          href={`/${r.slug}`}
                          className="chat-rec-card"
                        >
                          <div className="chat-rec-info">
                            <span className="chat-rec-name">{r.name}</span>
                            <span className="chat-rec-meta">
                              {r.categoryLabel} · {r.district}
                            </span>
                          </div>
                          <span className="chat-rec-match">
                            {r.aiMatch}%
                          </span>
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
      )}
    </div>
  );
}
