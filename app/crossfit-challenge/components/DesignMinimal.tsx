'use client';

import styles from './DesignMinimal.module.css';

export default function DesignMinimal() {
  return (
    <div className={styles.wrapper}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroName}>IRON REPUBLIC</h1>
        <p className={styles.heroTagline}>CrossFit &middot; Austin, TX</p>
        <div className={styles.heroLine} />
        <p className={styles.heroBody}>
          A space for deliberate movement and quiet strength. We believe fitness
          is not performed &mdash; it is practiced, with intention, day after day.
        </p>
      </section>

      <div className={styles.divider} />

      {/* Classes & Schedule */}
      <section className={styles.classes}>
        <div className={styles.inner}>
          <p className={styles.sectionLabel}>Classes</p>

          <div className={styles.classesGrid}>
            {[
              { name: 'WOD', time: 'Daily programming' },
              { name: 'Olympic Lifting', time: 'Technique focus' },
              { name: 'Endurance', time: 'Conditioning' },
              { name: 'Mobility', time: 'Recovery' },
              { name: 'Open Gym', time: 'Self-directed' },
            ].map((cls) => (
              <div key={cls.name} className={styles.classCard}>
                <h3 className={styles.className}>{cls.name}</h3>
                <p className={styles.classTime}>{cls.time}</p>
              </div>
            ))}
          </div>

          <div className={styles.schedule}>
            <span className={styles.scheduleItem}>
              <span className={styles.scheduleDay}>Mon&ndash;Fri</span> 5AM&ndash;9PM
            </span>
            <span className={styles.scheduleItem}>
              <span className={styles.scheduleDay}>Sat</span> 7AM&ndash;5PM
            </span>
            <span className={styles.scheduleItem}>
              <span className={styles.scheduleDay}>Sun</span> 8AM&ndash;2PM
            </span>
          </div>
        </div>
      </section>

      <div className={styles.divider} />

      {/* Coaches */}
      <section className={styles.coaches}>
        <div className={styles.inner}>
          <p className={styles.sectionLabel}>Coaches</p>

          <div className={styles.coachesGrid}>
            {[
              {
                name: 'Rex Dalton',
                role: 'Head Coach',
                bio: '15 years experience. CrossFit Games competitor.',
                image: '/crossfit/image-19.jpg',
              },
              {
                name: 'Maria Santos',
                role: 'Olympic Lifting',
                bio: 'Former national team member. Technique specialist.',
                image: '/crossfit/image-17.jpg',
              },
              {
                name: 'Jamal Wright',
                role: 'Endurance & Conditioning',
                bio: 'Ultramarathon runner. Builds unbreakable engines.',
                image: '/crossfit/image-16.jpg',
              },
              {
                name: 'Kira Volkov',
                role: 'Mobility & Recovery',
                bio: 'Physical therapy background. Keeps you moving well.',
                image: '/crossfit/image-9.jpg',
              },
            ].map((coach) => (
              <div key={coach.name} className={styles.coachCard}>
                <div className={styles.coachPhoto} style={{ backgroundImage: `url(${coach.image})` }} />
                <h3 className={styles.coachName}>{coach.name}</h3>
                <p className={styles.coachRole}>{coach.role}</p>
                <p className={styles.coachBio}>{coach.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.divider} />

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.inner}>
          <p className={styles.sectionLabel}>Words</p>

          <div className={styles.testimonialsList}>
            {[
              {
                quote:
                  'IRON REPUBLIC changed my life. Down 40lbs in 6 months.',
                author: 'Derek M.',
              },
              {
                quote:
                  'The coaches push you past what you thought possible.',
                author: 'Sarah K.',
              },
              {
                quote: 'Best community in Austin. Period.',
                author: 'Tommy R.',
              },
            ].map((t) => (
              <div key={t.author} className={styles.testimonialItem}>
                <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                <span className={styles.testimonialAuthor}>{t.author}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.divider} />

      {/* Pricing */}
      <section className={styles.pricing}>
        <div className={styles.inner}>
          <p className={styles.sectionLabel}>Membership</p>

          <div className={styles.pricingGrid}>
            {[
              { tier: 'Drop-in', amount: '$25', unit: 'per visit' },
              { tier: 'Monthly', amount: '$149', unit: 'per month' },
              { tier: 'Unlimited', amount: '$199', unit: 'per month' },
            ].map((plan) => (
              <div key={plan.tier} className={styles.pricingCard}>
                <p className={styles.pricingTier}>{plan.tier}</p>
                <p className={styles.pricingAmount}>{plan.amount}</p>
                <p className={styles.pricingUnit}>{plan.unit}</p>
                <button className={styles.pricingCta}>Begin</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.divider} />

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerName}>IRON REPUBLIC</p>
        <p className={styles.footerDetails}>
          1847 Industrial Blvd, Austin, TX
        </p>
        <p className={styles.footerCopy}>
          &copy; {new Date().getFullYear()} Iron Republic CrossFit
        </p>
      </footer>
    </div>
  );
}
