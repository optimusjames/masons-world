import styles from '../styles.module.css'
import { narrative } from '../data/narrative'

export default function NarrativePanel() {
  return (
    <aside className={styles.narrative}>
      {narrative.map((beat) => (
        <div key={beat.heading} className={styles.beat}>
          <span className={styles.beatEyebrow}>{beat.eyebrow}</span>
          <h2 className={styles.beatHeading}>{beat.heading}</h2>
          <p className={styles.beatBody}>{beat.body}</p>
        </div>
      ))}
    </aside>
  )
}
