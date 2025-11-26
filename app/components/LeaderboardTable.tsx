"use client";
import { useEffect, useState, useRef, Fragment } from "react";

type Member = {
  name: string | null;
  stars: number;
  score: number;
  starUp?: boolean;
  rankUp?: boolean;
};

export default function Leaderboard({ members }: { members: Member[] }) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const getRowStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-transparent border-l-4 border-l-yellow-400 text-yellow-100";
    if (index === 1) return "bg-gradient-to-r from-slate-300/10 via-slate-300/5 to-transparent border-l-4 border-l-slate-300 text-slate-100";
    if (index === 2) return "bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border-l-4 border-l-orange-500 text-orange-100";
    return "border-l-4 border-l-transparent hover:bg-white/5";
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">AOC Leaderboard</h1>

      <div className="rounded-lg shadow-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="p-3 text-left w-12">#</th>
              <th className="p-3 text-left">Jugador</th>
              <th className="p-3 text-left hidden md:table-cell w-32">Stars</th>
              <th className="p-3 text-left hidden md:table-cell w-24">Score</th>
              <th className="p-3 text-right md:hidden w-10"></th>
            </tr>
          </thead>

          <tbody>
            {members.map((m, i) => (
              <Fragment key={m.name || i}>
                <tr
                  onClick={() => toggleRow(i)}
                  className={`
                    border-b border-gray-800 
                    transition-all duration-500 
                    cursor-pointer md:cursor-default
                    ${getRowStyle(i)}
                    ${m.rankUp ? "animate-rankup" : ""}
                  `}
                >
                  <td className="p-3 font-bold whitespace-nowrap">{i + 1}</td>
                  <td className="p-3 font-medium truncate max-w-[150px] sm:max-w-xs">
                    {m.name || "Anónimo"}
                  </td>

                  {/* Desktop View */}
                  <td className="p-3 hidden md:table-cell whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⭐</span>
                      <span>{m.stars}</span>
                      {m.starUp && (
                        <span className="ml-2 text-yellow-300 animate-starpop text-sm">
                          +1
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-lg hidden md:table-cell whitespace-nowrap">
                    {m.score}
                  </td>

                  {/* Mobile View Indicator */}
                  <td className="p-3 text-right md:hidden">
                    <span className={`inline-block transition-transform duration-300 ${expandedRow === i ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </td>
                </tr>

                {/* Mobile Expanded Details */}
                {expandedRow === i && (
                  <tr className="md:hidden bg-gray-800/30 animate-fadeIn border-b border-gray-800">
                    <td colSpan={4} className="p-0">
                      <div className="p-4 flex justify-around items-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Stars</span>
                          <div className="flex items-center gap-2 text-xl font-bold text-yellow-400">
                            ⭐ {m.stars}
                          </div>
                        </div>
                        <div className="w-px h-10 bg-gray-700"></div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Score</span>
                          <span className="text-xl font-mono font-bold text-white">{m.score}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
