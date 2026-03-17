"use client";

import { useState, useEffect } from "react";

const GREETINGS = [
  { text: "Greetings, Earthling.", color: "#7FE8A0", glow: "#7FE8A0" },
  { text: "Oh, hello there.", color: "#1E3FBA", glow: "#4A8AFF" },
  { text: "You found me.", color: "#5EC47A", glow: "#7FE8A0" },
  { text: "Don\u2019t panic.", color: "#7FE8A0", glow: "#7FE8A0" },
  { text: "Signal received.", color: "#8FF7F9", glow: "#8FF7F9" },
  { text: "Transmission incoming.", color: "#5EC47A", glow: "#7FE8A0" },
];

function pick() {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

export default function RandomGreeting({ className }: { className?: string }) {
  const [greeting, setGreeting] = useState<(typeof GREETINGS)[number] | null>(null);

  useEffect(() => {
    const g = pick();
    setGreeting(g);
    document.documentElement.style.setProperty("--glow-color", g.glow);
  }, []);

  return (
    <div
      className={className}
      style={{
        color: greeting?.color ?? "transparent",
        textShadow: greeting
          ? `0 0 7px ${greeting.glow}90, 0 0 20px ${greeting.glow}60, 0 0 40px ${greeting.glow}30, 0 0 60px ${greeting.glow}18`
          : "none",
        opacity: greeting ? 1 : 0,
        transition: "opacity 0.4s ease-in",
      }}
    >
      {greeting?.text ?? "\u00A0"}
    </div>
  );
}
