"use client";

import { useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Member } from "../components/MemberModal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function StatsPage() {
  const { data, error } = useSWR("/api/aoc", fetcher, {
    refreshInterval: 900000,
    revalidateOnFocus: true
  });

  const members = (data?.members ?? []) as Member[];

  const stats = useMemo(() => {
    if (!members.length) return null;

    const totalMembers = members.length;
    const totalStars = members.reduce((acc, m) => acc + m.stars, 0);
    const activeMembers = members.filter(m => m.stars > 0).length;
    const avgStars = totalMembers ? (totalStars / totalMembers).toFixed(1) : "0";

    // Daily Completion
    const dailyStats = Array.from({ length: 12 }, (_, i) => {
      const day = String(i + 1);
      let p1 = 0;
      let p2 = 0;
      members.forEach(m => {
        if (m.completion_day_level[day]?.["1"]) p1++;
        if (m.completion_day_level[day]?.["2"]) p2++;
      });
      return { day: i + 1, p1, p2 };
    });

    // Stars by Hour (Distribution)
    const hours = new Array(24).fill(0);

    members.forEach(m => {
      if (!m.completion_day_level) return;
      
      Object.values(m.completion_day_level).forEach((day: any) => {
        if (!day) return;

        // Helper to process a star
        const processStar = (star: any) => {
            if (star && star.get_star_ts) {
                const ts = Number(star.get_star_ts);
                if (!isNaN(ts) && ts > 0) {
                    const date = new Date((ts - 3600) * 1000);
                    hours[date.getHours()]++;
                }
            }
        };

        // Check both string and number keys just in case
        processStar(day["1"] || day[1]);
        processStar(day["2"] || day[2]);
      });
    });

    return { totalMembers, totalStars, activeMembers, avgStars, dailyStats, hours };
  }, [members]);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando estadísticas...</div>;

  return (
    <main className="min-h-screen px-6 py-8 bg-[#0d0f18] text-slate-200">
      {/* DEBUG: Remove later */}
      {/* <div className="bg-red-900/50 p-4 mb-4 rounded text-xs font-mono overflow-auto max-h-40">
        {JSON.stringify(members[0]?.completion_day_level, null, 2)}
      </div> */}
      
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">📊 Estadísticas Globales</h1>
        <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm transition">
          ← Volver al Leaderboard
        </Link>
      </header>

      {stats && (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Miembros Totales" value={stats.totalMembers} icon="👥" color="text-blue-400" />
                <StatCard label="Estrellas Totales" value={stats.totalStars} icon="⭐" color="text-yellow-400" />
                <StatCard label="Miembros Activos" value={stats.activeMembers} icon="runner" customIcon={<span>🏃</span>} color="text-green-400" />
                <StatCard label="Promedio Estrellas" value={stats.avgStars} icon="chart" customIcon={<span>📈</span>} color="text-purple-400" />
            </div>

            {/* Daily Progress Chart */}
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-6 text-slate-300">Progreso Diario (Estrellas conseguidas)</h3>
                <div className="h-64 flex items-end gap-2 md:gap-4">
                    {stats.dailyStats.map((d) => (
                        <div key={d.day} className="flex-1 flex flex-col justify-end group relative h-full">
                            <div className="flex flex-col w-full gap-1 justify-end h-full">
                                {/* Stacked Bars: P2 at bottom, P1-P2 on top */}
                                <div className="w-full flex flex-col-reverse h-full justify-end">
                                    {/* P2 Bar */}
                                    <div 
                                        style={{ height: `${(d.p2 / stats.totalMembers) * 100}%` }} 
                                        className="w-full bg-yellow-500/80 rounded-sm relative group-hover:bg-yellow-400 transition-colors"
                                    >
                                        {d.p2 > 0 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{d.p2}</div>}
                                    </div>
                                    {/* P1 Diff Bar */}
                                    <div 
                                        style={{ height: `${((d.p1 - d.p2) / stats.totalMembers) * 100}%` }} 
                                        className="w-full bg-slate-500/50 rounded-sm relative group-hover:bg-slate-400 transition-colors mb-0.5"
                                    >
                                         {(d.p1 - d.p2) > 0 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{d.p1 - d.p2}</div>}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-slate-500 text-center mt-2">D{d.day}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500"></div> Estrella 2</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-500"></div> Solo Estrella 1</div>
                </div>
            </div>

            {/* Hourly Distribution Chart */}
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-6 text-slate-300">Actividad por Hora (Cuándo se consiguen las estrellas)</h3>
                <div className="h-48 flex items-end gap-1">
                    {stats.hours.map((count, h) => {
                        const max = Math.max(...stats.hours, 1);
                        const height = (count / max) * 100;
                        return (
                            <div key={h} className="flex-1 flex flex-col justify-end group relative h-full">
                                <div 
                                    style={{ height: `${height}%` }} 
                                    className="w-full bg-indigo-500/40 hover:bg-indigo-400 rounded-t-sm transition-colors min-h-[4px]"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                        {count} estrellas
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-600 text-center mt-1">{h}h</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, icon, customIcon, color }: any) {
    return (
        <div className="bg-slate-800/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-800/60 transition">
            <div className={`text-3xl ${color} bg-white/5 p-3 rounded-lg`}>
                {customIcon || icon}
            </div>
            <div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    )
}
