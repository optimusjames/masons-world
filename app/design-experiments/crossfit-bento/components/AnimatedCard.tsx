'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'motion/react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className }: AnimatedCardProps) {
  const [key, setKey] = useState(0);
  return (
    <motion.div
      key={key}
      className={className}
      onClick={() => setKey((k) => k + 1)}
      style={{ cursor: 'pointer' }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200, delay }}
    >
      {children}
    </motion.div>
  );
}
