"use client";
import { useEffect, useState, useRef } from "react";

type Member = {
  name: string | null;
  stars: number;
  score: number;
  starUp?: boolean;
  rankUp?: boolean;
};

export default function Leaderboard({ members }: { members: Member[] }) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">AOC Leaderboard</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Jugador</th>
            <th className="p-3 text-left">Stars</th>
            <th className="p-3 text-left">Score</th>
          </tr>
        </thead>

        <tbody>
          {members.map((m, i) => (
            <tr
              key={m.name || i}
              className={`
                border-b border-gray-800 
                transition-all duration-500 
                ${m.rankUp ? "animate-rankup" : ""}
              `}
            >
              <td className="p-3 font-bold">{i + 1}</td>
              <td className="p-3">{m.name || "Anónimo"}</td>

              <td className="p-3 flex items-center gap-2">
                ⭐ {m.stars}

                {m.starUp && (
                  <span className="ml-2 text-yellow-300 animate-starpop">
                    +1 ⭐
                  </span>
                )}
              </td>

              <td className="p-3">{m.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
