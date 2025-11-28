"use client";
import { useEffect, useState, useRef, Fragment } from "react";
import MemberModal, { Member } from "./MemberModal";
import VersusModal from "./VersusModal";

export default function Leaderboard({ members, dailyChampionId }: { members: Member[], dailyChampionId?: string | number | null }) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // --- Versus Mode State ---
  const [isVersusMode, setIsVersusMode] = useState(false);
  const [selectedVersus, setSelectedVersus] = useState<Member[]>([]);
  const [showVersusModal, setShowVersusModal] = useState(false);

  const toggleRow = (index: number) => {
    const member = members[index];

    if (isVersusMode) {
      // Lógica de selección para Versus
      if (selectedVersus.find(m => m.id === member.id)) {
        setSelectedVersus(selectedVersus.filter(m => m.id !== member.id));
      } else {
        if (selectedVersus.length < 2) {
          const newSelection = [...selectedVersus, member];
          setSelectedVersus(newSelection);
          if (newSelection.length === 2) {
            setShowVersusModal(true);
          }
        }
      }
      return;
    }

    // En móvil expande, en desktop abre modal
    if (window.innerWidth < 768) {
      setExpandedRow(expandedRow === index ? null : index);
    } else {
      setSelectedMember(member);
    }
  };

  const handleNameClick = (e: React.MouseEvent, member: Member) => {
    e.stopPropagation();
    if (isVersusMode) {
      toggleRow(members.findIndex(m => m.id === member.id));
    } else {
      setSelectedMember(member);
    }
  };

  const getRowStyle = (index: number, memberId: string | number) => {
    // Estilo de selección Versus
    if (isVersusMode && selectedVersus.find(m => m.id === memberId)) {
      return "bg-indigo-600/30 border-l-4 border-l-indigo-500 shadow-[inset_0_0_20px_rgba(79,70,229,0.3)]";
    }

    if (memberId === dailyChampionId) return "bg-gradient-to-r from-orange-600/20 via-red-500/10 to-transparent border-l-4 border-l-orange-500 text-orange-100 animate-pulse-slow glow-fire";
    if (index === 0) return "bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-transparent border-l-4 border-l-yellow-400 text-yellow-100 glow-gold";
    if (index === 1) return "bg-gradient-to-r from-slate-300/10 via-slate-300/5 to-transparent border-l-4 border-l-slate-300 text-slate-100 glow-silver";
    if (index === 2) return "bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border-l-4 border-l-orange-500 text-orange-100 glow-bronze";
    return "border-l-4 border-l-transparent hover:bg-white/5";
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">AOC Leaderboard</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsVersusMode(!isVersusMode);
              setSelectedVersus([]);
            }}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${
              isVersusMode 
                ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30" 
                : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30"
            }`}
          >
            {isVersusMode ? "Cancelar Versus" : "⚔️ Modo Versus"}
          </button>
        </div>
      </div>

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
                    ${getRowStyle(i, m.id)}
                    ${m.rankUp ? "animate-rankup" : ""}
                  `}
                >
                  <td className="p-3 font-bold whitespace-nowrap">
                    {i + 1}
                  </td>
                  <td 
                    className="p-3 font-medium max-w-[150px] sm:max-w-xs hover:text-indigo-400 transition-colors cursor-pointer"
                    onClick={(e) => handleNameClick(e, m)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate">{m.name || "Anónimo"}</span>
                      {m.id === dailyChampionId && <span className="text-xl animate-bounce">🔥</span>}
                    </div>
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

      <MemberModal 
        member={selectedMember} 
        open={!!selectedMember} 
        onClose={() => setSelectedMember(null)} 
      />

      {showVersusModal && selectedVersus.length === 2 && (
        <VersusModal
          memberA={selectedVersus[0]}
          memberB={selectedVersus[1]}
          open={true}
          onClose={() => {
            setShowVersusModal(false);
            setSelectedVersus([]);
          }}
        />
      )}
    </div>
  );
}
