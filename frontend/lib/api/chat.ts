const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/v1`;

const SESSION_KEY = "gastro_chat_session";

export interface ChatSource {
  name: string;
  slug: string;
  category: string | null;
  district: string | null;
  price_range: number | null;
  price_label?: string | null;
  rating: number | null;
  score?: number;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
  sources: ChatSource[];
}

/** Stable per-browser session id so chat history survives reloads / revisits. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function fetchHistory(sessionId: string): Promise<ChatHistoryMessage[]> {
  const res = await fetch(`${BASE}/chat/history/${sessionId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.messages ?? [];
}

export async function clearHistory(sessionId: string): Promise<void> {
  await fetch(`${BASE}/chat/history/${sessionId}`, { method: "DELETE" });
}

type StreamEvent =
  | { type: "token"; content: string }
  | { type: "sources"; sources: ChatSource[] }
  | { type: "done" }
  | { type: "error"; message: string };

interface StreamHandlers {
  onToken: (text: string) => void;
  onSources: (sources: ChatSource[]) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

/** POST a message and consume the SSE token stream. */
export async function streamChat(
  sessionId: string,
  message: string,
  handlers: StreamHandlers,
): Promise<void> {
  const res = await fetch(`${BASE}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  if (!res.ok || !res.body) {
    handlers.onError("Không kết nối được tới máy chủ.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      let event: StreamEvent;
      try {
        event = JSON.parse(payload);
      } catch {
        continue;
      }
      switch (event.type) {
        case "token":
          handlers.onToken(event.content);
          break;
        case "sources":
          handlers.onSources(event.sources);
          break;
        case "done":
          handlers.onDone();
          return;
        case "error":
          handlers.onError(event.message);
          return;
      }
    }
  }
  handlers.onDone();
}
