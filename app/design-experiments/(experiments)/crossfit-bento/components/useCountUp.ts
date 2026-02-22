import { useEffect, useState } from 'react';

export function useCountUp(target: number, duration = 800, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isFinite(target) || target === 0) {
      setValue(target || 0);
      return;
    }
    const timeout = setTimeout(() => {
      const start = performance.now();
      function tick() {
        const elapsed = performance.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}
