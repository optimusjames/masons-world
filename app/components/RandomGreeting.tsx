"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

const BASE_SHADOW = (glow: string) =>
  `0 0 7px ${glow}90, 0 0 20px ${glow}60, 0 0 40px ${glow}30, 0 0 60px ${glow}18`;

const BRIGHT_SHADOW = (glow: string) =>
  `0 0 10px ${glow}cc, 0 0 30px ${glow}90, 0 0 60px ${glow}50, 0 0 90px ${glow}30`;

export default function RandomGreeting({ className }: { className?: string }) {
  const [greeting, setGreeting] = useState<(typeof GREETINGS)[number] | null>(null);
  const [textBright, setTextBright] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const g = pick();
    setGreeting(g);
    document.documentElement.style.setProperty("--glow-color", g.glow);
  }, []);

  const handleClick = useCallback(() => {
    if (!greeting) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setTextBright(true);
    timerRef.current = setTimeout(() => setTextBright(false), 1000);
  }, [greeting]);

  return (
    <div
      className={className}
      onClick={handleClick}
      style={{
        color: greeting?.color ?? "transparent",
        textShadow: greeting
          ? textBright ? BRIGHT_SHADOW(greeting.glow) : BASE_SHADOW(greeting.glow)
          : "none",
        opacity: greeting ? 1 : 0,
        transition: "opacity 0.4s ease-in, text-shadow 2s ease",
        cursor: "pointer",
      }}
    >
      {greeting?.text ?? "\u00A0"}
    </div>
  );
}
