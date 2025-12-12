"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import confetti from "canvas-confetti";
import LeaderboardTable from "./components/LeaderboardTable";
import JoinModal from "./components/JoinModal";
import Podium from "./components/Podium";
import { Member } from "./components/MemberModal";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Page() {
  const { data, error } = useSWR("/api/aoc", fetcher, { 
    refreshInterval: 900000,
    revalidateOnFocus: true // Actualizar al volver a la pestaña (útil tras suspensión)
  });

  const [processedMembers, setProcessedMembers] = useState<Member[]>([]);
  const last = data?.updated ?? null;

  useEffect(() => {
    if (!data?.members) return;

    const currentData = data.members as Member[];

    try {
      const stored = localStorage.getItem("aoc_leaderboard_prev");
      const prevMap = stored ? JSON.parse(stored) : {};

      const newMembers = currentData.map((m, index) => {
        // Usar id o name como identificador único
        const key = String(m.id || m.name || `unknown-${index}`);
        const prev = prevMap[key];

        let rankUp = false;
        let starUp = false;

        if (prev) {
          // Si el índice actual es MENOR que el anterior, subió de rango (ej: 5 -> 3)
          if (index < prev.rank) rankUp = true;
          // Si tiene más estrellas
          if (m.stars > prev.stars) starUp = true;
        }

        return { ...m, rankUp, starUp };
      });

      setProcessedMembers(newMembers);

      // Guardar estado actual para la próxima
      const newMap: Record<string, any> = {};
      currentData.forEach((m, index) => {
        const key = String(m.id || m.name || `unknown-${index}`);
        newMap[key] = { rank: index, stars: m.stars };
      });

      localStorage.setItem("aoc_leaderboard_prev", JSON.stringify(newMap));

    } catch (e) {
      console.error("Error accessing localStorage", e);
      setProcessedMembers(currentData);
    }

  }, [data]);

  const displayMembers = processedMembers.length > 0 ? processedMembers : (data?.members ?? []);

  // Calcular el campeón del día (el más rápido del último día activo)
  let dailyChampionId: string | number | null = null;
  if (displayMembers.length > 0) {
    // 1. Encontrar el último día con actividad
    let maxDay = 0;
    displayMembers.forEach((m: Member) => {
      Object.keys(m.completion_day_level).forEach(d => {
        const dayNum = parseInt(d);
        if (dayNum > maxDay) maxDay = dayNum;
      });
    });

    if (maxDay > 0) {
      const dayStr = String(maxDay);
      // 2. Buscar quién consiguió la estrella 2 más rápido ese día
      let bestTime = Infinity;
      
      displayMembers.forEach((m: Member) => {
        const dayData = m.completion_day_level[dayStr];
        if (dayData?.["2"]) {
           const ts = dayData["2"].get_star_ts;
           if (ts < bestTime) {
             bestTime = ts;
             dailyChampionId = m.id;
           }
        }
      });
      
      // Si nadie tiene la estrella 2, buscar la estrella 1
      if (!dailyChampionId) {
         bestTime = Infinity;
         displayMembers.forEach((m: Member) => {
          const dayData = m.completion_day_level[dayStr];
          if (dayData?.["1"]) {
             const ts = dayData["1"].get_star_ts;
             if (ts < bestTime) {
               bestTime = ts;
               dailyChampionId = m.id;
             }
          }
        });
      }
    }
  }

  const [open, setOpen] = useState(false);
  const [showPodium, setShowPodium] = useState(true);

  // --- Cuenta regresiva ---
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const target = new Date(`${new Date().getFullYear()}-12-01T00:00:00`);
    target.setHours(target.getHours() - 1); // Ajuste de -1 hora

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

  // --- Fireworks on Dec 12 ---
  useEffect(() => {
    const now = new Date();
    // Month is 0-indexed (11 = December)
    // SIMULACIÓN ACTIVADA: Cambiar a (now.getMonth() === 11 && now.getDate() === 12) para producción
    if (now.getMonth() === 11 && now.getDate() === 12) {
      const duration = 15 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
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
              🚀 ¡Advent of Code ha Terminado! 🎄
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
        {/* Toggle View */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800/50 p-1 rounded-lg flex gap-1 border border-white/10">
            <button
              onClick={() => setShowPodium(true)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                showPodium ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              🏆 Podio
            </button>
            <button
              onClick={() => setShowPodium(false)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                !showPodium ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              📋 Tabla Completa
            </button>
          </div>
        </div>

        {showPodium ? (
          <Podium members={[...displayMembers].sort((a, b) => b.score - a.score || b.stars - a.stars).slice(0, 3)} />
        ) : (
          <LeaderboardTable members={displayMembers} dailyChampionId={dailyChampionId} />
        )}

        <div className="text-center text-sm text-slate-400 mt-4 flex flex-col gap-1">
          {error ? (
            <span>Error cargando leaderboard</span>
          ) : last ? (
            <>
              <span>Última actualización: {new Date(new Date(last).getTime() - 3600000).toLocaleString()}</span>
              <span className="text-xs text-slate-500">
                (Se actualiza cada 15 min para respetar las reglas de AoC)
              </span>
            </>
          ) : (
            <span>Cargando...</span>
          )}
        </div>
      </div>
      <JoinModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
