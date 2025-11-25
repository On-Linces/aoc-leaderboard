"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import LeaderboardTable from "./components/LeaderboardTable";
import JoinModal from "./components/JoinModal";

type Member = { id?: string | number; name: string | null; stars: number; score: number };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Page() {
  const { data, error } = useSWR("/api/aoc", fetcher, { refreshInterval: 900000 });

  const members: Member[] = data?.members ?? [];
  const last = data?.updated ?? null;

  const [open, setOpen] = useState(false);

  // --- Cuenta regresiva ---
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const target = new Date(`${new Date().getFullYear()}-12-01T00:00:00`);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = target.getTime() - now;

      if (diff <= 0) {
        setCountdown("¡Advent of Code ha comenzado!");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  // --- Fin cuenta regresiva ---

  return (
    <main className="min-h-screen px-6 py-8">
      <header className="header flex justify-between items-center">
        <span>OnLinces — AoC Leaderboard</span>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white text-sm transition"
        >
          ¿Cómo unirme?
        </button>
      </header>

    <div className="text-center mt-6">
      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text drop-shadow-sm">
        {countdown}
      </span>
    </div>


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
