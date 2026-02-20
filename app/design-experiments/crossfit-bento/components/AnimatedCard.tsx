'use client';

import { useState, ReactNode, useCallback } from 'react';
import { motion } from 'motion/react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className }: AnimatedCardProps) {
  const [key, setKey] = useState(0);

  const handleClick = useCallback(() => {
    setKey((k) => k + 1);
  }, []);

  // key=0 is the initial mount, key>0 is a replay
  const isReplay = key > 0;

  return (
    <motion.div
      key={key}
      className={className}
      onClick={handleClick}
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
