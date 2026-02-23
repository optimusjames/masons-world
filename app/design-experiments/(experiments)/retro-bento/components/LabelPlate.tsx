import styles from './LabelPlate.module.css';

interface LabelPlateProps {
  text: string;
  className?: string;
}

export function LabelPlate({ text, className }: LabelPlateProps) {
  return (
    <div className={`${styles.plate} ${className || ''}`}>
      {text}
    </div>
  );
}
