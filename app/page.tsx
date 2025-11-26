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
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const target = new Date(`${new Date().getFullYear()}-12-01T00:00:00`);

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target.getTime() - now;

      if (diff <= 0) {
        setHasStarted(true);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({ d, h, m, s });
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);
  // --- Fin cuenta regresiva ---

  // Generar nieve (Client-side only para evitar hydration mismatch)
  const [snowflakes, setSnowflakes] = useState<{ id: number; left: string; animationDuration: string; animationDelay: string; opacity: number }[]>([]);

  useEffect(() => {
    setSnowflakes(
      Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.5 + 0.1,
      }))
    );
  }, []);

  return (
    <main className="min-h-screen px-6 py-8 relative overflow-hidden">
      {/* Snow Container */}
      <div className="snow-container">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snow"
            style={{
              left: flake.left,
              animationDuration: flake.animationDuration,
              animationDelay: flake.animationDelay,
              opacity: flake.opacity,
            }}
          />
        ))}
      </div>

      <header className="header flex justify-between items-center rounded-xl">
        <span className="flex items-center gap-2">
          🎄 OnLinces — AoC Leaderboard
        </span>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white text-sm transition shadow-lg shadow-indigo-500/30"
        >
          ¿Cómo unirme?
        </button>
      </header>

      <div className="text-center mt-8 mb-4">
        {hasStarted ? (
          <div className="inline-block p-6 rounded-2xl bg-green-500/20 backdrop-blur-md border border-green-500/50 shadow-[0_0_30px_rgba(0,255,100,0.3)] animate-popIn">
            <span className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">
              🚀 ¡Advent of Code ha comenzado! 🎄
            </span>
          </div>
        ) : timeLeft ? (
          <div className="flex justify-center gap-4 md:gap-6">
            {[
              { label: "DÍAS", value: timeLeft.d },
              { label: "HRS", value: timeLeft.h },
              { label: "MIN", value: timeLeft.m },
              { label: "SEG", value: timeLeft.s },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-2xl md:text-4xl font-mono font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                    {String(item.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[10px] md:text-xs text-gray-400 mt-2 font-bold tracking-widest">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <span className="text-slate-500 animate-pulse">Cargando cronómetro...</span>
          </div>
        )}
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
