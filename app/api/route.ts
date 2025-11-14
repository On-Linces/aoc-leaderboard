import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const members = (await kv.get("aoc_leaderboard")) ?? [];
    const last = (await kv.get("aoc_last_update")) ?? null;
    return NextResponse.json({ members, last });
  } catch (err) {
    return NextResponse.json({ members: [], last: null });
  }
}
