import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { AiChat } from "@/components/ai-chat";
import { restaurants } from "@/lib/mock-data";

export default function ChatPage() {
  return (
    <main className="ai-chat-page">
      <header className="ai-chat-header">
        <div className="ai-chat-header-inner">
          <div className="ai-chat-header-icon">
            <Sparkle size={18} weight="fill" />
          </div>
          <div>
            <h1 className="ai-chat-header-title">AI Trợ lý</h1>
            <p className="ai-chat-header-sub">
              Tìm quán theo cảm xúc và gu ẩm thực của bạn
            </p>
          </div>
        </div>
      </header>
      <AiChat restaurants={restaurants} />
    </main>
  );
}
