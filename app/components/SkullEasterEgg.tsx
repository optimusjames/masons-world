"use client";

import { useState, useCallback } from "react";
import { Permanent_Marker } from "next/font/google";

const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function SkullEasterEgg({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);

  const handleClick = useCallback(() => {
    if (visible) return;
    setVisible(true);
    setTimeout(() => setVisible(false), 525);
  }, [visible]);

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <span
        className={className}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
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
            background: "rgba(255, 255, 255, 0.95)",
            color: "#1a1a1a",
            fontSize: "0.75rem",
            padding: "5px 10px 4px",
            borderRadius: "6px",
            letterSpacing: "0.04em",
          }}
        >
          Amor Fati!
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
              borderTop: "5px solid rgba(255, 255, 255, 0.95)",
            }}
          />
        </span>
      </span>
    </span>
  );
}
