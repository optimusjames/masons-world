"use client";

import { useState, useCallback, useRef } from "react";
import { Shell } from "lucide-react";
import { Permanent_Marker } from "next/font/google";

const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const themes = {
  dark: {
    bubble: "rgba(255, 255, 255, 0.95)",
    text: "#1a1a1a",
  },
  light: {
    bubble: "rgba(30, 30, 30, 0.92)",
    text: "#f0f0f0",
  },
};

export default function ShellEasterEgg({
  variant = "dark",
}: {
  variant?: "light" | "dark";
}) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const theme = themes[variant];
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleClick = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setVisible(true);
    timersRef.current.push(setTimeout(() => setVisible(false), 900));
    const el = document.querySelector<HTMLElement>('[class*="ambientGlow"]');
    if (el) {
      el.style.transition = "opacity 1.5s ease";
      el.style.opacity = "0.13";
      timersRef.current.push(setTimeout(() => {
        el.style.opacity = "";
        timersRef.current.push(setTimeout(() => { el.style.transition = ""; }, 1500));
      }, 900));
    }
  }, []);

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <Shell
        size={18}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: "pointer",
          color: "rgba(255,255,255,0.65)",
          outline: "none",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
        role="button"
        tabIndex={0}
        aria-label="Easter egg"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: "calc(100% + 12px)",
          left: "50%",
          transform: `translateX(-50%) scale(${visible ? 1 : 0})`,
          opacity: visible ? 1 : 0,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          transition: visible
            ? "transform 0.35s cubic-bezier(0.34, 1.8, 0.64, 1), opacity 0.1s ease"
            : "transform 0.15s ease-in, opacity 0.15s ease-in",
          transformOrigin: "bottom center",
        }}
      >
        {/* Speech bubble */}
        <span
          className={marker.className}
          style={{
            display: "block",
            position: "relative",
            background: theme.bubble,
            color: theme.text,
            fontSize: "0.75rem",
            padding: "5px 10px 4px",
            borderRadius: "6px",
            letterSpacing: "0.04em",
          }}
        >
          Infinito
          {/* Bubble tail */}
          <span
            style={{
              position: "absolute",
              bottom: "-5px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid ${theme.bubble}`,
            }}
          />
        </span>
      </span>
    </span>
  );
}
