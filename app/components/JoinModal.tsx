"use client";
import React from "react";

export default function JoinModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fadeIn z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-xl w-full max-w-md animate-popIn">
            <h2 className="text-xl font-bold text-white mb-4">¿Cómo unirte al leaderboard?</h2>

            <ol className="text-slate-300 space-y-2 list-decimal ml-5">
              <li>Inicia sesión en <strong>adventofcode.com</strong>.</li>
              <li>Ve a <strong>Leaderboards → Private Leaderboard</strong>.</li>
              <li>Ingresa el código:</li>

              <div className="bg-gray-800 p-3 rounded-md text-center text-lg font-mono text-yellow-300 border border-gray-700">
                <span>🔑 Código de invitación:<br/> <strong>1554482-d8cbd8ba</strong></span>
              </div>

              <li>Una vez dentro, tu progreso aparecerá aquí automáticamente.</li>
            </ol>

            <button
              onClick={() => onClose()}
              className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white transition"
            >
              Cerrar
            </button>
          </div>
        </div>
  );
}
