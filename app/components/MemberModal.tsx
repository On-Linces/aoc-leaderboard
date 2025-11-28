"use client";
import { Fragment } from "react";

type StarInfo = {
  get_star_ts: number;
  star_index: number;
};

type CompletionDayLevel = {
  [day: string]: {
    1?: StarInfo;
    2?: StarInfo;
  };
};

export type Member = {
  id: string | number;
  name: string | null;
  stars: number;
  score: number;
  local_score: number;
  global_score: number;
  last_star_ts: number;
  completion_day_level: CompletionDayLevel;
  rankUp?: boolean;
  starUp?: boolean;
  supporter?: boolean;
};

export default function MemberModal({
  member,
  open,
  onClose,
}: {
  member: Member | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !member) return null;

  // Generar array de días 1-25
  const days = Array.from({ length: 25 }, (_, i) => i + 1);

  const formatTime = (ts: number) => {
    if (!ts) return "-";
    return new Date(ts * 1000).toLocaleString("es-MX", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Cálculo de Logros ---
  type Badge = { icon: string; name: string; desc: string; color: string };
  const badges: Badge[] = [];

  const addBadge = (b: Badge) => badges.push(b);

  // 1. ⚡ Velocidad (Delta P1 -> P2)
  let minDelta = Infinity;
  Object.values(member.completion_day_level).forEach(d => {
    if (d["1"] && d["2"]) {
      const delta = d["2"].get_star_ts - d["1"].get_star_ts;
      if (delta < minDelta) minDelta = delta;
    }
  });

  if (minDelta < 900) {
     addBadge({ icon: "🚀", name: "Velocidad Luz", desc: "Parte 2 en < 15 min", color: "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20" });
  } else if (minDelta < 1200) {
     addBadge({ icon: "⚡⚡", name: "Velocista II", desc: "Parte 2 en < 20 min", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" });
  } else if (minDelta < 2400) {
     addBadge({ icon: "⚡", name: "Velocista I", desc: "Parte 2 en < 40 min", color: "text-yellow-600 bg-yellow-600/10 border-yellow-600/20" });
  }

  // 2. 🎒 Colección de Estrellas
  if (member.stars >= 50) {
    addBadge({ icon: "🌌", name: "Maestro del Universo", desc: "50 Estrellas", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" });
  } else if (member.stars >= 25) {
    addBadge({ icon: "🌟", name: "Cazador de Estrellas", desc: "25+ Estrellas", color: "text-pink-400 bg-pink-400/10 border-pink-400/20" });
  } else if (member.stars >= 10) {
    addBadge({ icon: "🎒", name: "Coleccionista", desc: "10+ Estrellas", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" });
  } else if (member.stars >= 5) {
    addBadge({ icon: "👶", name: "Iniciado", desc: "5+ Estrellas", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" });
  }

  // 3. 🔥 Rachas
  let maxStreak = 0;
  let currentStreak = 0;
  for (let d = 1; d <= 25; d++) {
    if (member.completion_day_level[String(d)]) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 0;
    }
  }
  maxStreak = Math.max(maxStreak, currentStreak);

  if (maxStreak >= 25) {
    addBadge({ icon: "👑", name: "Dios del Código", desc: "Racha de 25 días", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" });
  } else if (maxStreak >= 14) {
    addBadge({ icon: "🌋", name: "Imparable", desc: "Racha de 14+ días", color: "text-red-500 bg-red-500/10 border-red-500/20" });
  } else if (maxStreak >= 7) {
    addBadge({ icon: "🔥🔥", name: "En Llamas", desc: "Racha de 7+ días", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" });
  } else if (maxStreak >= 3) {
    addBadge({ icon: "🔥", name: "Calentando", desc: "Racha de 3+ días", color: "text-orange-300 bg-orange-300/10 border-orange-300/20" });
  }

  // 4. Horarios
  const hours = Object.values(member.completion_day_level).flatMap(d => {
      const h = [];
      if (d["1"]) h.push(new Date(d["1"].get_star_ts * 1000).getHours());
      if (d["2"]) h.push(new Date(d["2"].get_star_ts * 1000).getHours());
      return h;
  });
  
  if (hours.some(h => h >= 1 && h <= 5)) {
    addBadge({ icon: "🦉", name: "Búho Nocturno", desc: "Resuelve de madrugada", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" });
  }
  if (hours.some(h => h >= 5 && h <= 8)) {
    addBadge({ icon: "☕", name: "Madrugador", desc: "Resuelve al amanecer", color: "text-amber-700 bg-amber-700/10 border-amber-700/20" });
  }
  if (hours.some(h => h >= 12 && h <= 14)) {
    addBadge({ icon: "🥪", name: "Hora de Comer", desc: "Resuelve en el almuerzo", color: "text-lime-400 bg-lime-400/10 border-lime-400/20" });
  }

  // 5. Especiales
  const daysStarted = Object.values(member.completion_day_level).length;
  const daysCompleted = Object.values(member.completion_day_level).filter(d => d["1"] && d["2"]).length;
  
  if (daysStarted > 0 && daysStarted === daysCompleted && daysStarted >= 5) {
      addBadge({ icon: "💎", name: "Perfeccionista", desc: "Siempre completa ambos (min 5)", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" });
  }

  // 6. AoC++ Supporter
  if (member.supporter) {
    addBadge({ icon: "➕", name: "AoC++", desc: "Supporter oficial", color: "text-green-400 bg-green-400/10 border-green-400/20" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className="bg-[#0d0f18] border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {member.name || "Anónimo"}
              {member.supporter && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/50 font-mono" title="AoC++ Supporter">
                  AoC++
                </span>
              )}
              <span className="text-sm bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/50">
                ⭐ {member.stars}
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">ID: {member.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Badges Section */}
          {badges.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-400 mb-3">Logros Desbloqueados</h3>
              <div className="flex flex-wrap gap-3">
                {badges.map((badge, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${badge.color}`}
                    title={badge.desc}
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm leading-none">{badge.name}</span>
                      <span className="text-[10px] opacity-80">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-lg font-semibold text-indigo-400 mb-4">Progreso Diario</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {days.map((day) => {
              const dayData = member.completion_day_level[String(day)];
              const part1 = dayData?.["1"];
              const part2 = dayData?.["2"];
              const isCompleted = part1 && part2;
              const hasStarted = !!part1;

              if (!hasStarted) return null; // Ocultar días sin empezar para no saturar, o mostrar gris

              return (
                <div 
                  key={day} 
                  className={`
                    p-3 rounded-xl border 
                    ${isCompleted 
                      ? "bg-green-900/20 border-green-500/30" 
                      : "bg-gray-800/40 border-gray-700"}
                  `}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-200">Día {day}</span>
                    <div className="flex gap-1">
                      <span className={part1 ? "text-yellow-400" : "text-gray-700"}>★</span>
                      <span className={part2 ? "text-yellow-400" : "text-gray-700"}>★</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Parte 1:</span>
                      <span className="text-slate-300">{part1 ? formatTime(part1.get_star_ts) : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parte 2:</span>
                      <span className="text-slate-300">{part2 ? formatTime(part2.get_star_ts) : "-"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {Object.keys(member.completion_day_level).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 italic">
                Este usuario aún no ha conseguido estrellas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
