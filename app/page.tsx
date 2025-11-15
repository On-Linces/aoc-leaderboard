"use client";

import { useState } from "react";
import useSWR from "swr";
import LeaderboardTable from "./components/LeaderboardTable";
import JoinModal from "./components/JoinModal";

type Member = { id?: string | number; name: string | null; stars: number; score: number };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Page() {
  const { data, error } = useSWR("/api/aoc", fetcher, { refreshInterval: 900000 }); // 15 min

  const members: Member[] = data?.members ?? [];
  const last = data?.updated ?? null;

  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen px-6 py-8">
      <header className="header flex justify-between items-center">
        <span>OnLinces — AoC Leaderboard</span>

        {/* Botón para abrir modal */}
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white text-sm transition"
        >
          ¿Cómo unirme?
        </button>
      </header>

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
      <JoinModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
