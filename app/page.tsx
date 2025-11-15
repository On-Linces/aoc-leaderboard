"use client";
import useSWR from "swr";
import LeaderboardTable from "./components/LeaderboardTable";

type Member = { id?: string | number; name: string | null; stars: number; score: number };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Page() {
  const { data, error } = useSWR("/api/aoc", fetcher, { refreshInterval: 900000 }); // 15 min

  const members: Member[] = data?.members ?? [];
  const last = data?.updated ?? null;
  console.log("Leaderboard data:", data);

  return (
    <main className="min-h-screen px-6 py-8">
      <header className="header">OnLinces — AoC Leaderboard</header>

      <div className="max-w-4xl mx-auto mt-6">
        <LeaderboardTable members={members} />

        <div className="text-center text-sm text-slate-400 mt-4">
          {error ? (
            <span>Error cargando leaderboard</span>
          ) : last ? (
            <span>Última actualización: {new Date(last).toLocaleString()}</span>
          ) : (
            <span>Cargando...</span>
          )}
        </div>
      </div>
    </main>
  );
}
