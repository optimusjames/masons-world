import styles from './MapHero.module.css'

/**
 * The opening of every map experiment: where, what, and the one sentence that
 * says what the map is for.
 *
 * The dek is the hook, so it is set to be read rather than skimmed past on the
 * way to the numbers. It inherits the page's tokens (--ink, --ink-soft,
 * --accent), so a map recolors it by setting those, and --hero-eyebrow if the
 * eyebrow should not be the accent.
 *
 * `data-map-hero` is also what tells the experiment frame to drop its tag row
 * on map pages. The tags still appear in the footer.
 */
export default function MapHero({
  place,
  title,
  dek,
}: {
  place: string
  title: string
  dek: string
}) {
  return (
    <header className={styles.hero} data-map-hero>
      <div className={styles.eyebrow}>{place}</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.dek}>{dek}</p>
    </header>
  )
}
