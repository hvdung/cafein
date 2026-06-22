import { NextResponse } from "next/server";
import { getRestaurantBySlug } from "@/lib/search";

export function GET(_: Request, { params }: { params: { slug: string } }) {
  const restaurant = getRestaurantBySlug(params.slug);

  if (!restaurant) {
  return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(restaurant);
}
