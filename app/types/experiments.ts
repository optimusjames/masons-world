export type ExperimentCategory = 'Civic & Data' | 'Wellness & Movement' | 'Tools & Craft'

export interface Experiment {
  slug: string
  date: string
  title: string
  description: string
  /**
   * Short pitch for the home page. `description` runs long by design (the
   * gallery wants the full account), so a featured card needs its own line.
   * Without one, the home page falls back to the first sentence of
   * `description`, which reads acceptably but rarely well.
   */
  blurb?: string
  /** One concrete impact or scope fact for the home page, e.g. "3 yrs with ODOT
   *  & PBOT". The shared tags say nothing a reader cannot already see. */
  scope?: string
  screenshot?: string
  tags: string[]
  theme?: 'light' | 'dark'
  category: ExperimentCategory
}
