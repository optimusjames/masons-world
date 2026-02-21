import { RetroTechPanel } from './components/RetroTechPanel';
import { SwissFrame } from '../components/SwissFrame';
import styles from './page.module.css';

export default function RetroTechPage() {
  return (
    <div className={styles.page}>
      <SwissFrame
        logo="RC-1 Control"
        meta="Design Experiment"
        subLabels={['Audio Interface Study', 'Skeuomorphic / Hardware', 'Feb 2026']}
        footerLabels={['48kHz / 24bit', 'DM Mono + Archivo Narrow', 'SN 2024-0847']}
        variant="light"
      >
        <RetroTechPanel />
      </SwissFrame>
    </div>
  );
}
