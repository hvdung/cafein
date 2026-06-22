"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import { AiChat } from "@/components/ai-chat";
import type { Restaurant } from "@/lib/mock-data";

export function RightPanel({ restaurants }: { restaurants: Restaurant[] }) {
  const [tab, setTab] = useState<"map" | "chat">("map");

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
      <ClockCounterClockwise size={15} weight={tab === "chat" ? "fill" : "regular"} />
      History of search
    </button>
    </div>

    {/* Map tab */}
    {tab === "map" && (
    <div className="map-pane-body">
      <div className="map-bg-grid" />
      <div className="map-road-h" style={{ top: "30%" }} />
      <div className="map-road-h" style={{ top: "62%" }} />
      <div className="map-road-v" style={{ left: "36%" }} />
      <div className="map-road-v" style={{ left: "68%" }} />
      <span
      className="map-label"
      style={{ top: "28%", left: "38%", transform: "translateY(-100%)" }}
      >
      Lê Lợi
      </span>
      <span
      className="map-label"
      style={{ top: "60%", left: "70%", transform: "translateY(-100%)" }}
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
      <MapPin size={11} weight="fill" style={{ display: "inline", marginRight: 4 }} />
      Google Maps tích hợp sắp ra mắt
      </div>
    </div>
    )}

    {/* Chat tab */}
    {tab === "chat" && <AiChat restaurants={restaurants} />}
  </div>
  );
}
