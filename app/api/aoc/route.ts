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

const SESSION = process.env.AOC_SESSION;
const BOARD = process.env.AOC_BOARD;
const YEAR = process.env.AOC_YEAR ?? "2024";

export async function GET() {
  if (!SESSION || !BOARD) {
    return NextResponse.json(
      { ok: false, error: "AOC_SESSION o AOC_BOARD no configurados" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://adventofcode.com/${YEAR}/leaderboard/private/view/${BOARD}.json`,
      {
        headers: { Cookie: `session=${SESSION}` },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      console.error("Error fetching AoC leaderboard:", res.status, txt);
      return NextResponse.json(
        {
          ok: false,
          status: res.status,
          text: txt,
        },
        { status: 500 }
      );
    }

    const data = await res.json();

    // Transformar miembros
    const members = Object.values(data.members || {}).map((m: any) => ({
      id: m.id,
      name: m.name,
      stars: m.stars,
      score: m.local_score,
    }));

    // Ordenar por estrellas, luego score
    members.sort(
      (a: any, b: any) => b.stars - a.stars || b.score - a.score
    );

    // 🔥 RETORNAR SIN GUARDAR EN KV
    return NextResponse.json({
      ok: true,
      updated: new Date().toISOString(),
      members,
    });
  } catch (err: any) {
    console.error("Error processing AoC leaderboard:", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? String(err) },
      { status: 500 }
    );
  }
}
