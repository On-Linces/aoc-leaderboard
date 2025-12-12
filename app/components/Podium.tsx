import { Member } from "./MemberModal";

export default function Podium({ members }: { members: Member[] }) {
  if (members.length < 3) return null;

  // Asumimos que members viene ordenado por puntaje descendente
  const [first, second, third] = members;

  return (
    <div className="flex justify-center items-end gap-2 md:gap-8 mb-12 mt-8 px-2">
      {/* 2nd Place */}
      <div className="flex flex-col items-center w-1/3 md:w-1/4 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
        <div className="mb-2 text-center flex flex-col items-center">
          <span className="text-2xl md:text-4xl mb-1">🥈</span>
          <h3 className="text-sm md:text-xl font-bold text-slate-300 truncate w-full text-center">{second.name || `Anon #${second.id}`}</h3>
          <div className="flex items-center gap-1 text-xs md:text-sm text-slate-400">
            <span>{second.score} pts</span>
            <span className="text-yellow-500">★{second.stars}</span>
          </div>
        </div>
        <div className="w-full h-32 md:h-48 bg-gradient-to-t from-slate-800 to-slate-600/50 rounded-t-lg border-t-4 border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.3)] flex items-end justify-center pb-4 relative overflow-hidden group">
           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <span className="text-4xl md:text-6xl font-black text-white/10 select-none">2</span>
        </div>
      </div>

      {/* 1st Place */}
      <div className="flex flex-col items-center w-1/3 md:w-1/4 animate-fadeIn z-10">
        <div className="mb-2 text-center flex flex-col items-center">
          <span className="text-4xl md:text-6xl drop-shadow-lg mb-1">👑</span>
          <h3 className="text-base md:text-2xl font-bold text-yellow-300 truncate w-full text-center">{first.name || `Anon #${first.id}`}</h3>
          <div className="flex items-center gap-1 text-xs md:text-sm text-yellow-200/80">
            <span>{first.score} pts</span>
            <span className="text-yellow-400">★{first.stars}</span>
          </div>
        </div>
        <div className="w-full h-48 md:h-64 bg-gradient-to-t from-yellow-800 to-yellow-600/50 rounded-t-lg border-t-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] flex items-end justify-center pb-4 relative overflow-hidden group">
           <div className="absolute inset-0 bg-yellow-400/10 animate-pulse"></div>
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <span className="text-6xl md:text-8xl font-black text-white/10 select-none">1</span>
        </div>
      </div>

      {/* 3rd Place */}
      <div className="flex flex-col items-center w-1/3 md:w-1/4 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
        <div className="mb-2 text-center flex flex-col items-center">
          <span className="text-2xl md:text-4xl mb-1">🥉</span>
          <h3 className="text-sm md:text-xl font-bold text-orange-300 truncate w-full text-center">{third.name || `Anon #${third.id}`}</h3>
          <div className="flex items-center gap-1 text-xs md:text-sm text-orange-400">
            <span>{third.score} pts</span>
            <span className="text-yellow-600">★{third.stars}</span>
          </div>
        </div>
        <div className="w-full h-24 md:h-32 bg-gradient-to-t from-orange-900 to-orange-700/50 rounded-t-lg border-t-4 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-end justify-center pb-4 relative overflow-hidden group">
           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <span className="text-4xl md:text-6xl font-black text-white/10 select-none">3</span>
        </div>
      </div>
    </div>
  );
}
