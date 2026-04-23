'use client';
import { useRef, ReactNode } from 'react';
import css from './ShakeCard.module.css';

export default function ShakeCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function handlePointerDown() {
    const el = ref.current;
    if (!el) return;
    el.classList.remove(css.shake);
    void el.offsetWidth;
    el.classList.add(css.shake);
  }
  return (
    <div ref={ref} onPointerDown={handlePointerDown} className={className}>
      {children}
    </div>
  );
}
