import { NextRequest, NextResponse } from "next/server";
import { searchRestaurants } from "@/lib/search";

export function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const category = request.nextUrl.searchParams.get("category") || undefined;
  const openNow = request.nextUrl.searchParams.get("openNow") === "1";

  const data = searchRestaurants({ query: q, category, openNow });
  return NextResponse.json({ total: data.length, items: data });
}
