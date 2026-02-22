'use client';

import { useState, useCallback, useRef } from 'react';
import type { KnobState, FaderState } from '../types';

export function useKnob(initial: number, min = 0, max = 100): KnobState {
  const [value, setValue] = useState(initial);
  const dragRef = useRef<{ startX: number; startVal: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startVal: value };
    },
    [value],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const delta = (e.clientX - dragRef.current.startX) * ((max - min) / 200);
      const next = Math.round(
        Math.min(max, Math.max(min, dragRef.current.startVal + delta)),
      );
      setValue(next);
    },
    [min, max],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const rotation = ((value - min) / (max - min)) * 270 - 135;

  return { value, rotation, onPointerDown, onPointerMove, onPointerUp };
}

export function useFader(initial: number, min = 0, max = 100): FaderState {
  const [value, setValue] = useState(initial);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const pct = 1 - (clientY - rect.top) / rect.height;
      setValue(Math.round(Math.min(max, Math.max(min, pct * (max - min) + min))));
    },
    [min, max],
  );

  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const track = trackRef.current;
      if (track) track.setPointerCapture(e.pointerId);
      setDragging(true);
      handleInteraction(e.clientY);
    },
    [handleInteraction],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      handleInteraction(e.clientY);
    },
    [dragging, handleInteraction],
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const pct = ((value - min) / (max - min)) * 100;

  return { value, pct, dragging, trackRef, onPointerDown, onPointerMove, onPointerUp };
}
