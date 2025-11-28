// import { NextResponse } from "next/server";
// import { kv } from "@vercel/kv";

// const SESSION = process.env.AOC_SESSION;
// const BOARD = process.env.AOC_BOARD;
// const YEAR = process.env.AOC_YEAR ?? "2024";

// export async function GET() {
//   if (!SESSION || !BOARD) {
//     return NextResponse.json({ ok: false, error: "AOC_SESSION o AOC_BOARD no configurados" }, { status: 500 });
//   }

//   try {
//     const res = await fetch(`https://adventofcode.com/${YEAR}/leaderboard/private/view/${BOARD}.json`, {
//       headers: { Cookie: `session=${SESSION}` },
//       cache: "no-store",
//     });

//     if (!res.ok) {
//       const txt = await res.text();
//       // Print the error for debugging
//       console.error("Error fetching AoC leaderboard:", res.status, txt);
//       return NextResponse.json({ ok: false, status: res.status, text: txt }, { status: 500 });
//     }

//     const data = await res.json();

//     const members = Object.values(data.members || {}).map((m: any) => ({
//       id: m.id,
//       name: m.name,
//       stars: m.stars,
//       score: m.local_score,
//     }));

//     members.sort((a: any, b: any) => b.stars - a.stars || b.score - a.score);

//     // Guardar en KV
//     await kv.set("aoc_leaderboard", members);
//     await kv.set("aoc_last_update", new Date().toISOString());

//     return NextResponse.json({ ok: true, updated: new Date().toISOString(), count: members.length });
//   } catch (err: any) {
//     console.error("Error processing AoC leaderboard:", err);
//     return NextResponse.json({ ok: false, error: err.message ?? String(err) }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const SESSION = process.env.AOC_SESSION;
const BOARD = process.env.AOC_BOARD;
const YEAR = process.env.AOC_YEAR ?? "2024";

// Función cacheada que obtiene y procesa los datos
const getCachedLeaderboard = unstable_cache(
  async () => {
    if (!SESSION || !BOARD) throw new Error("Configuración faltante");

    const res = await fetch(
      `https://adventofcode.com/${YEAR}/leaderboard/private/view/${BOARD}.json`,
      {
        headers: { Cookie: `session=${SESSION}` },
        // No usamos next: { revalidate } aquí porque unstable_cache ya maneja el tiempo
      }
    );

    if (!res.ok) {
      throw new Error(`Error AoC: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();

    // Transformar miembros
    const members = Object.values(data.members || {}).map((m: any) => ({
      id: m.id,
      name: m.name,
      stars: m.stars,
      score: m.local_score,
      local_score: m.local_score,
      global_score: m.global_score,
      last_star_ts: m.last_star_ts,
      completion_day_level: m.completion_day_level,
      supporter: m.supporter ?? false,
    }));

    // Ordenar
    members.sort((a: any, b: any) => b.stars - a.stars || b.score - a.score);

    return {
      ok: true,
      updated: new Date().toISOString(), // Se genera SOLO cuando se ejecuta esta función (cada 15 min)
      day1_ts: data.day1_ts,
      owner_id: data.owner_id,
      event: data.event,
      members,
    };
  },
  ["aoc-leaderboard-data"], // Key del cache
  { revalidate: 900 } // 15 minutos
);

export async function GET() {
  try {
    const data = await getCachedLeaderboard();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error processing AoC leaderboard:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? String(err) },
      { status: 500 }
    );
  }
}
