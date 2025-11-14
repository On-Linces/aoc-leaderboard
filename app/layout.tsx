import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "OnLinces AoC Leaderboard",
  description: "Leaderboard Advent of Code - OnLinces"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
