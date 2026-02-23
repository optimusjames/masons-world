import styles from './LedIndicator.module.css';

interface LedIndicatorProps {
  state?: 'off' | 'dim' | 'on' | 'accent';
  color?: string;
  size?: number;
  className?: string;
}

export function LedIndicator({ state = 'off', color, size = 6, className }: LedIndicatorProps) {
  return (
    <div
      className={`${styles.led} ${styles[state]} ${className || ''}`}
      style={{
        width: size,
        height: size,
        ...(color && state !== 'off' ? { '--led-color': color } as React.CSSProperties : {}),
      }}
    />
  );
}
