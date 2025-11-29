"use client";
import { Member } from "./MemberModal";

export default function VersusModal({
  memberA,
  memberB,
  open,
  onClose,
}: {
  memberA: Member | null;
  memberB: Member | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !memberA || !memberB) return null;

  // --- Lógica de Comparación ---
  let winsA = 0;
  let winsB = 0;
  
  // Datos para la gráfica (Estrellas acumuladas por día)
  // Inicializamos con 0 estrellas en el día 0
  const chartData = [{ day: 0, starsA: 0, starsB: 0 }];
  let accumStarsA = 0;
  let accumStarsB = 0;

  for (let day = 1; day <= 12; day++) {
    const d = String(day);
    const dataA = memberA.completion_day_level[d];
    const dataB = memberB.completion_day_level[d];

    // 1. Calcular Ganador del Día (Head-to-Head)
    // Prioridad: Tener Parte 2 > Tener Parte 1 > No tener nada
    // Si ambos tienen lo mismo, gana el menor timestamp
    let winner = null; // 'A', 'B', or null (tie/none)

    const getTime = (m: any, part: "1" | "2") => m?.[part]?.get_star_ts || Infinity;
    
    const a2 = getTime(dataA, "2");
    const b2 = getTime(dataB, "2");
    const a1 = getTime(dataA, "1");
    const b1 = getTime(dataB, "1");

    if (a2 !== Infinity && b2 !== Infinity) {
      if (a2 < b2) winner = 'A'; else winner = 'B';
    } else if (a2 !== Infinity) {
      winner = 'A';
    } else if (b2 !== Infinity) {
      winner = 'B';
    } else if (a1 !== Infinity && b1 !== Infinity) {
      if (a1 < b1) winner = 'A'; else winner = 'B';
    } else if (a1 !== Infinity) {
      winner = 'A';
    } else if (b1 !== Infinity) {
      winner = 'B';
    }

    if (winner === 'A') winsA++;
    if (winner === 'B') winsB++;

    // 2. Calcular Estrellas Acumuladas para la Gráfica
    if (dataA?.["1"]) accumStarsA++;
    if (dataA?.["2"]) accumStarsA++;
    if (dataB?.["1"]) accumStarsB++;
    if (dataB?.["2"]) accumStarsB++;

    chartData.push({ day, starsA: accumStarsA, starsB: accumStarsB });
  }

  // --- Renderizado de Gráfica SVG ---
  const width = 500;
  const height = 200;
  const padding = 20;
  const maxStars = Math.max(accumStarsA, accumStarsB, 10); // Minimo escala de 10
  
  const getX = (day: number) => padding + (day / 12) * (width - 2 * padding);
  const getY = (stars: number) => height - padding - (stars / maxStars) * (height - 2 * padding);

  const pointsA = chartData.map(d => `${getX(d.day)},${getY(d.starsA)}`).join(" ");
  const pointsB = chartData.map(d => `${getX(d.day)},${getY(d.starsB)}`).join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div
        className="bg-[#0d0f18] border border-indigo-500/30 w-full max-w-3xl rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header VS */}
        <div className="relative p-4 md:p-8 flex justify-between items-center bg-gradient-to-b from-indigo-900/20 to-transparent">
          
          {/* Jugador A */}
          <div className="flex flex-col items-center w-[40%] md:w-1/3">
            <h2 className="text-sm md:text-2xl font-bold text-cyan-400 text-center truncate w-full">{memberA.name || "Anónimo"}</h2>
            <span className="text-3xl md:text-6xl font-bold text-white mt-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              {winsA}
            </span>
            <span className="text-[10px] md:text-xs text-cyan-300/50 uppercase tracking-widest mt-1 text-center">Días Ganados</span>
          </div>

          {/* VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-indigo-600 rounded-full flex items-center justify-center border-2 md:border-4 border-[#0d0f18] shadow-lg z-10">
              <span className="font-black italic text-white text-sm md:text-xl">VS</span>
            </div>
          </div>

          {/* Jugador B */}
          <div className="flex flex-col items-center w-[40%] md:w-1/3">
            <h2 className="text-sm md:text-2xl font-bold text-fuchsia-400 text-center truncate w-full">{memberB.name || "Anónimo"}</h2>
            <span className="text-3xl md:text-6xl font-bold text-white mt-2 drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]">
              {winsB}
            </span>
            <span className="text-[10px] md:text-xs text-fuchsia-300/50 uppercase tracking-widest mt-1 text-center">Días Ganados</span>
          </div>
        </div>

        {/* Gráfica de Carrera */}
        <div className="hidden md:block p-6 bg-slate-900/30 border-t border-white/5">
          <h3 className="text-center text-slate-400 text-sm mb-4 uppercase tracking-widest">Carrera de Estrellas (Progreso)</h3>
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(p => (
                <line 
                  key={p} 
                  x1={padding} 
                  y1={getY(maxStars * p)} 
                  x2={width - padding} 
                  y2={getY(maxStars * p)} 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="1" 
                />
              ))}

              {/* Line A (Cyan) */}
              <polyline 
                points={pointsA} 
                fill="none" 
                stroke="#22d3ee" 
                strokeWidth="3" 
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
              />

              {/* Line B (Fuchsia) */}
              <polyline 
                points={pointsB} 
                fill="none" 
                stroke="#e879f9" 
                strokeWidth="3" 
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]"
              />
            </svg>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs font-bold">
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              {memberA.name}
            </div>
            <div className="flex items-center gap-2 text-fuchsia-400">
              <div className="w-3 h-3 bg-fuchsia-400 rounded-full"></div>
              {memberB.name}
            </div>
          </div>
        </div>

        <div className="p-4 text-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition"
          >
            Cerrar Versus
          </button>
        </div>
      </div>
    </div>
  );
}
