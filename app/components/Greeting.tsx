"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// A single, deliberate greeting — the one signature moment of delight on the
// home page. Sets the page-wide --glow-color and pulses on click.
const GREETING = { text: "Oh, hello there.", color: "#4A8AFF", glow: "#4A8AFF" };

const BASE_SHADOW = (glow: string) =>
  `0 0 7px ${glow}90, 0 0 20px ${glow}60, 0 0 40px ${glow}30, 0 0 60px ${glow}18`;

const BRIGHT_SHADOW = (glow: string) =>
  `0 0 18px ${glow}ff, 0 0 50px ${glow}bb, 0 0 100px ${glow}70, 0 0 140px ${glow}40`;

export default function Greeting({ className }: { className?: string }) {
  const [textBright, setTextBright] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const glowTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setMounted(true);
    document.documentElement.style.setProperty("--glow-color", GREETING.glow);
  }, []);

  const handleClick = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTextBright(true);
    timerRef.current = setTimeout(() => setTextBright(false), 1500);

    // Subtle ambient glow pulse
    glowTimersRef.current.forEach(clearTimeout);
    glowTimersRef.current = [];
    const el = document.querySelector<HTMLElement>('[class*="ambientGlow"]');
    if (el) {
      el.style.transition = "opacity 1.5s ease";
      el.style.opacity = "0.12";
      glowTimersRef.current.push(setTimeout(() => {
        el.style.opacity = "";
        glowTimersRef.current.push(setTimeout(() => { el.style.transition = ""; }, 1500));
      }, 1500));
    }
  }, []);

  return (
    <div
      className={className}
      onClick={handleClick}
      style={{
        color: GREETING.color,
        textShadow: textBright ? BRIGHT_SHADOW(GREETING.glow) : BASE_SHADOW(GREETING.glow),
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease-in, text-shadow 2s ease",
        cursor: "pointer",
      }}
    >
      {GREETING.text}
    </div>
  );
}
