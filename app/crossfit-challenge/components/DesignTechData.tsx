'use client'

import styles from './DesignTechData.module.css'

const schedule = [
  {
    day: 'Monday',
    classes: [
      { time: '5:00 AM', name: 'WOD', status: 'Open' },
      { time: '6:30 AM', name: 'Olympic Lifting', status: 'Open' },
      { time: '12:00 PM', name: 'Endurance', status: 'Full' },
      { time: '5:30 PM', name: 'WOD', status: 'Open' },
      { time: '7:00 PM', name: 'Mobility', status: 'Open' },
    ],
  },
  {
    day: 'Tuesday',
    classes: [
      { time: '5:00 AM', name: 'Endurance', status: 'Open' },
      { time: '9:00 AM', name: 'Open Gym', status: 'Open' },
      { time: '12:00 PM', name: 'WOD', status: 'Open' },
      { time: '5:30 PM', name: 'Olympic Lifting', status: 'Open' },
    ],
  },
  {
    day: 'Wednesday',
    classes: [
      { time: '5:00 AM', name: 'WOD', status: 'Open' },
      { time: '6:30 AM', name: 'Mobility', status: 'Open' },
      { time: '12:00 PM', name: 'Endurance', status: 'Full' },
      { time: '5:30 PM', name: 'WOD', status: 'Open' },
    ],
  },
  {
    day: 'Thursday',
    classes: [
      { time: '5:00 AM', name: 'Olympic Lifting', status: 'Open' },
      { time: '9:00 AM', name: 'Open Gym', status: 'Open' },
      { time: '12:00 PM', name: 'WOD', status: 'Open' },
      { time: '5:30 PM', name: 'Endurance', status: 'Open' },
      { time: '7:00 PM', name: 'Mobility', status: 'Open' },
    ],
  },
  {
    day: 'Friday',
    classes: [
      { time: '5:00 AM', name: 'WOD', status: 'Open' },
      { time: '6:30 AM', name: 'Olympic Lifting', status: 'Full' },
      { time: '12:00 PM', name: 'Open Gym', status: 'Open' },
      { time: '5:30 PM', name: 'WOD', status: 'Open' },
    ],
  },
]

const coaches = [
  {
    name: 'Rex Dalton',
    role: 'Head Coach',
    years: 15,
    specialty: 'CrossFit Games Competitor',
    tags: ['CrossFit', 'Competition', 'Programming'],
    image: '/crossfit/image-3.jpg',
  },
  {
    name: 'Maria Santos',
    role: 'Olympic Lifting Specialist',
    years: 12,
    specialty: 'Former National Team',
    tags: ['Oly Lifting', 'Technique', 'Strength'],
    image: '/crossfit/image-24.jpg',
  },
  {
    name: 'Jamal Wright',
    role: 'Endurance & Conditioning',
    years: 10,
    specialty: 'Ultramarathon Runner',
    tags: ['Endurance', 'Cardio', 'MetCon'],
    image: '/crossfit/image-2.jpg',
  },
  {
    name: 'Kira Volkov',
    role: 'Mobility & Recovery',
    years: 8,
    specialty: 'Physical Therapy Background',
    tags: ['Mobility', 'Recovery', 'Rehab'],
    image: '/crossfit/image-23.jpg',
  },
]

const testimonials = [
  {
    text: 'IRON REPUBLIC changed my life. Down 40lbs in 6 months.',
    author: 'Derek M.',
    rating: 9.8,
    metric: 'Body Composition',
    months: 6,
  },
  {
    text: 'The coaches push you past what you thought possible.',
    author: 'Sarah K.',
    rating: 9.6,
    metric: 'Performance',
    months: 14,
  },
  {
    text: 'Best community in Austin. Period.',
    author: 'Tommy R.',
    rating: 9.9,
    metric: 'Community',
    months: 22,
  },
]

const pricingFeatures = [
  { feature: 'Facility Access', dropin: true, monthly: true, unlimited: true },
  { feature: 'Group Classes', dropin: '1 class', monthly: '12/mo', unlimited: true },
  { feature: 'Open Gym', dropin: false, monthly: true, unlimited: true },
  { feature: 'Coach Programming', dropin: false, monthly: false, unlimited: true },
  { feature: 'InBody Scans', dropin: false, monthly: 'Monthly', unlimited: 'Bi-weekly' },
  { feature: 'Nutrition Consult', dropin: false, monthly: false, unlimited: true },
  { feature: 'Guest Passes', dropin: false, monthly: '1/mo', unlimited: '4/mo' },
]

function renderCell(val: boolean | string) {
  if (val === true) return <span className={styles.check}>&#10003;</span>
  if (val === false) return <span className={styles.dash}>&mdash;</span>
  return <span>{val}</span>
}

export default function DesignTechData() {
  return (
    <div className={styles.wrapper}>
      {/* ── Topbar ── */}
      <header className={styles.topbar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>IR</div>
          <div>
            <span className={styles.logoText}>IRON REPUBLIC</span>
            <span className={styles.logoSub}> CrossFit</span>
          </div>
        </div>
        <nav className={styles.nav}>
          <span className={styles.navLink}>Dashboard</span>
          <span className={styles.navLink}>Schedule</span>
          <span className={styles.navLink}>Coaches</span>
          <span className={styles.navLink}>Pricing</span>
          <button className={styles.navCta}>Start Trial</button>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            Now Enrolling &mdash; Austin, TX
          </div>
          <h1 className={styles.heroTitle}>
            Train Smarter at{' '}
            <span className={styles.heroTitleAccent}>IRON REPUBLIC</span>
          </h1>
          <p className={styles.heroDesc}>
            Data-driven CrossFit training backed by real metrics. Track every
            rep, measure every gain, and see the results that matter.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.btnPrimary}>Get Started</button>
            <button className={styles.btnSecondary}>View Schedule</button>
          </div>
        </div>

        <div className={styles.heroStats}>
          {[
            { num: '500+', label: 'Active Members', pct: 92 },
            { num: '15,000+', label: 'WODs Completed', pct: 88 },
            { num: '98%', label: 'Retention Rate', pct: 98 },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <p className={styles.statNumber}>{s.num}</p>
              <p className={styles.statLabel}>{s.label}</p>
              <div className={styles.statBar}>
                <div
                  className={styles.statBarFill}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Classes / Schedule ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Schedule</span>
          <h2 className={styles.sectionTitle}>Class Dashboard</h2>
        </div>

        <div className={styles.scheduleGrid}>
          {schedule.map((day) => (
            <div key={day.day} className={styles.scheduleCol}>
              <div className={styles.scheduleDay}>{day.day}</div>
              {day.classes.map((cls, i) => (
                <div key={i} className={styles.classCard}>
                  <span className={styles.classTime}>{cls.time}</span>
                  <span className={styles.className}>{cls.name}</span>
                  <span
                    className={`${styles.classStatus} ${
                      cls.status === 'Full' ? styles.classStatusFull : ''
                    }`}
                  >
                    <span className={styles.classStatusDot} />
                    {cls.status === 'Full' ? 'Waitlist' : 'Spots Open'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.scheduleInfo}>
          <div className={styles.scheduleInfoItem}>
            <span className={styles.scheduleInfoLabel}>Mon-Fri</span>
            5AM &ndash; 9PM
          </div>
          <div className={styles.scheduleInfoItem}>
            <span className={styles.scheduleInfoLabel}>Sat</span>
            7AM &ndash; 5PM
          </div>
          <div className={styles.scheduleInfoItem}>
            <span className={styles.scheduleInfoLabel}>Sun</span>
            8AM &ndash; 2PM
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Coaches ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Team</span>
          <h2 className={styles.sectionTitle}>Coaching Staff</h2>
        </div>

        <div className={styles.coachesGrid}>
          {coaches.map((c) => (
            <div key={c.name} className={styles.coachCard}>
              <div className={styles.coachPhoto} style={{ backgroundImage: `url(${c.image})` }}>
                <div className={styles.coachPhotoGrid} />
              </div>
              <div className={styles.coachInfo}>
                <h3 className={styles.coachName}>{c.name}</h3>
                <p className={styles.coachRole}>{c.role}</p>
                <div className={styles.coachStats}>
                  <div className={styles.coachStatItem}>
                    <span className={styles.coachStatVal}>{c.years}</span>
                    <span className={styles.coachStatLabel}>Years Exp</span>
                  </div>
                </div>
                <div className={styles.coachTags}>
                  {c.tags.map((t) => (
                    <span key={t} className={styles.coachTag}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Testimonials ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Metrics</span>
          <h2 className={styles.sectionTitle}>Member Results</h2>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((t) => (
            <div key={t.author} className={styles.testimonialCard}>
              <div className={styles.testimonialRating}>
                <div className={styles.ratingBarTrack}>
                  <div
                    className={styles.ratingBarFill}
                    style={{ width: `${t.rating * 10}%` }}
                  />
                </div>
                <span className={styles.ratingValue}>{t.rating}/10</span>
              </div>
              <p className={styles.testimonialText}>&ldquo;{t.text}&rdquo;</p>
              <p className={styles.testimonialAuthor}>{t.author}</p>
              <p className={styles.testimonialMeta}>
                {t.metric} &middot; {t.months} months
              </p>
            </div>
          ))}
        </div>

        <div className={styles.satisfactionBar}>
          <span className={styles.satisfactionLabel}>
            Overall Satisfaction Score
          </span>
          <div className={styles.satisfactionTrack}>
            <div
              className={styles.satisfactionFill}
              style={{ width: '97%' }}
            />
          </div>
          <span className={styles.satisfactionValue}>9.7</span>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Pricing ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Plans</span>
          <h2 className={styles.sectionTitle}>Membership Comparison</h2>
        </div>

        <table className={styles.pricingTable}>
          <thead>
            <tr>
              <th>Feature</th>
              <th>
                <div className={styles.pricingHeader}>
                  <span className={styles.planName}>Drop-in</span>
                  <span className={styles.planPrice}>$25 / visit</span>
                </div>
              </th>
              <th>
                <div className={styles.pricingHeader}>
                  <span className={styles.planName}>Monthly</span>
                  <span className={styles.planPrice}>$149 / mo</span>
                </div>
              </th>
              <th>
                <div className={styles.pricingHeader}>
                  <span className={styles.planName}>
                    Unlimited
                    <span className={styles.popularBadge}>Popular</span>
                  </span>
                  <span className={styles.planPrice}>$199 / mo</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {pricingFeatures.map((row) => (
              <tr key={row.feature} className={styles.featureRow}>
                <td>{row.feature}</td>
                <td>{renderCell(row.dropin)}</td>
                <td>{renderCell(row.monthly)}</td>
                <td>{renderCell(row.unlimited)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pricingCta}>
          <button className={styles.btnPrimary}>Choose a Plan</button>
          <p className={styles.pricingNote}>
            No contracts. Cancel anytime. 7-day free trial on all plans.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <span className={styles.footerBrandName}>
                IRON REPUBLIC CrossFit
              </span>
              <p className={styles.footerAddress}>
                1847 Industrial Blvd
                <br />
                Austin, TX
              </p>
            </div>
            <div className={styles.footerCol}>
              <h4>Programs</h4>
              <ul>
                <li>WOD</li>
                <li>Olympic Lifting</li>
                <li>Endurance</li>
                <li>Mobility</li>
                <li>Open Gym</li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Company</h4>
              <ul>
                <li>About</li>
                <li>Coaches</li>
                <li>Careers</li>
                <li>Blog</li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Hours</h4>
              <ul>
                <li>Mon-Fri: 5AM-9PM</li>
                <li>Sat: 7AM-5PM</li>
                <li>Sun: 8AM-2PM</li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.systemStatus}>
              <span className={styles.statusIndicator} />
              All Systems Operational
            </div>
            <p className={styles.footerCopy}>
              &copy; 2026 IRON REPUBLIC CrossFit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
