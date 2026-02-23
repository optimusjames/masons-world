'use client';

import { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';

export function useTextScramble(text: string, delay = 0) {
  const [display, setDisplay] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const length = text.length;
      let frame = 0;
      const totalFrames = 20;

      intervalRef.current = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;

        const result = text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i / length < progress) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');

        setDisplay(result);

        if (frame >= totalFrames) {
          clearInterval(intervalRef.current);
          setDisplay(text);
        }
      }, 40);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalRef.current);
    };
  }, [text, delay]);

  return display;
}
