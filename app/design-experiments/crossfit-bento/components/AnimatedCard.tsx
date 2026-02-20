'use client';

import { useState, useRef, ReactNode } from 'react';
import { motion } from 'motion/react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className }: AnimatedCardProps) {
  const [key, setKey] = useState(0);
  const hasMounted = useRef(false);
  const isReplay = hasMounted.current;

  if (key > 0) hasMounted.current = true;

  return (
    <motion.div
      key={key}
      className={className}
      onClick={() => setKey((k) => k + 1)}
      style={{ cursor: 'pointer' }}
      initial={isReplay ? { scale: 0.96 } : { opacity: 0, y: 14 }}
      animate={isReplay ? { scale: 1 } : { opacity: 1, y: 0 }}
      transition={
        isReplay
          ? { type: 'spring', damping: 12, stiffness: 300 }
          : { type: 'spring', damping: 20, stiffness: 200, delay }
      }
    >
      {children}
    </motion.div>
  );
}
