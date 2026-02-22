'use client';

import { useEffect, useState } from 'react';
import styles from './DesignBrutalV2.module.css';

export default function DesignBrutalV2() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const anim = (delay?: number) =>
    mounted
      ? `${styles.animateUp}${delay ? ` ${styles[`delay${delay}`]}` : ''}`
      : styles.hidden;

  const animLeft = (delay?: number) =>
    mounted
      ? `${styles.animateLeft}${delay ? ` ${styles[`delay${delay}`]}` : ''}`
      : styles.hidden;

  const animRight = (delay?: number) =>
    mounted
      ? `${styles.animateRight}${delay ? ` ${styles[`delay${delay}`]}` : ''}`
      : styles.hidden;

  return (
    <div className={styles.wrapper}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroDiagonal} />
        <div className={styles.heroStatus}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>System Online</span>
        </div>
        <div className={styles.heroContent}>
          <span className={`${styles.heroLabel} ${anim()}`}>
            EST. 2019 // Austin, TX
          </span>
          <h1
            className={`${styles.heroTitle} ${anim(1)}`}
          >
            IRON
            <br />
            <span className={styles.accent}>REPUBLIC</span>
          </h1>
          <p className={`${styles.heroSubtitle} ${anim(2)}`}>CrossFit</p>
          <hr className={`${styles.heroRule} ${anim(3)}`} />
          <button className={`${styles.heroCta} ${anim(4)}`}>
            Start Your Trial
          </button>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.heroMetaLine}>1847 Industrial Blvd</span>
          <span className={styles.heroMetaLine}>Austin, TX</span>
          <span className={styles.heroMetaLine}>Mon-Fri 5AM-9PM</span>
        </div>
      </section>

      {/* ===== SYSTEM STATUS BAR ===== */}
      <div className={styles.systemBar}>
        <div className={styles.systemBarLeft}>
          <div className={styles.systemBarItem}>
            <span className={styles.systemBarDot} />
            <span>Facility Active</span>
          </div>
          <div className={styles.systemBarItem}>
            <span>Capacity: 78%</span>
          </div>
          <div className={styles.systemBarItem}>
            <span>Athletes Online: 142</span>
          </div>
        </div>
        <div>IR-SYS v2.0</div>
      </div>

      {/* ===== CLASSES / SCHEDULE ===== */}
      <div className={styles.sectionClasses}>
      <section className={styles.section}>
        <div className={anim()}>
          <span className={styles.sectionLabel}>// Programs</span>
          <h2 className={styles.sectionTitle}>
            Classes<span className={styles.accent}> //</span>
          </h2>
        </div>
        <div className={styles.classesGrid}>
          {[
            { name: 'WOD', meta: 'High Intensity', idx: '01' },
            { name: 'Olympic Lifting', meta: 'Strength / Power', idx: '02' },
            { name: 'Endurance', meta: 'Cardio / Stamina', idx: '03' },
            { name: 'Mobility', meta: 'Recovery / Flex', idx: '04' },
            { name: 'Open Gym', meta: 'Self-Directed', idx: '05' },
          ].map((c, i) => (
            <div
              key={c.idx}
              className={`${styles.classCard} ${anim(i < 5 ? (i + 1) as 1 | 2 | 3 | 4 | 5 : undefined)}`}
            >
              <div className={styles.classIndex}>{c.idx}</div>
              <div className={styles.className}>{c.name}</div>
              <div className={styles.classMeta}>{c.meta}</div>
            </div>
          ))}
        </div>

        <div className={`${styles.scheduleBar} ${anim(3)}`}>
          <div className={styles.scheduleDay}>
            <div className={styles.scheduleDayLabel}>Mon - Fri</div>
            <div className={styles.scheduleDayTime}>5:00 AM - 9:00 PM</div>
          </div>
          <div className={styles.scheduleDay}>
            <div className={styles.scheduleDayLabel}>Saturday</div>
            <div className={styles.scheduleDayTime}>7:00 AM - 5:00 PM</div>
          </div>
          <div className={styles.scheduleDay}>
            <div className={styles.scheduleDayLabel}>Sunday</div>
            <div className={styles.scheduleDayTime}>8:00 AM - 2:00 PM</div>
          </div>
        </div>
      </section>
      </div>

      {/* ===== PERFORMANCE METRICS ===== */}
      <section className={styles.metricsSection}>
        <div className={styles.metricsInner}>
          <div className={anim()}>
            <span className={styles.sectionLabel}>// Data Feed</span>
            <h2 className={styles.sectionTitle}>
              Performance Metrics<span className={styles.accent}> //</span>
            </h2>
          </div>

          {/* Stat cards */}
          <div className={styles.metricsGrid}>
            {[
              { value: '347', label: 'Active Members' },
              { value: '12K', label: 'WODs Completed' },
              { value: '94%', label: 'Retention Rate' },
              { value: '1,847', label: 'PRs This Year' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`${styles.metricCard} ${anim((i + 1) as 1 | 2 | 3 | 4)}`}
              >
                <div className={styles.metricValue}>{stat.value}</div>
                <div className={styles.metricLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Horizontal bar chart - Class Attendance */}
          <div className={`${styles.chartContainer} ${anim(2)}`}>
            <div className={styles.chartTitle}>
              Weekly Class Attendance (Avg)
            </div>
            {[
              { label: 'WOD', value: 89, display: '89%' },
              { label: 'Oly Lift', value: 72, display: '72%' },
              { label: 'Endurance', value: 65, display: '65%' },
              { label: 'Mobility', value: 48, display: '48%' },
              { label: 'Open Gym', value: 55, display: '55%' },
            ].map((row, i) => (
              <div key={row.label} className={styles.chartRow}>
                <div className={styles.chartLabel}>{row.label}</div>
                <div className={styles.chartBarTrack}>
                  <div
                    className={styles.chartBar}
                    style={{
                      width: `${row.value}%`,
                      animationDelay: `${0.3 + i * 0.15}s`,
                    }}
                  />
                </div>
                <div className={styles.chartValue}>{row.display}</div>
              </div>
            ))}
          </div>

          {/* Two column charts */}
          <div className={styles.chartsRow}>
            {/* Member Growth (vertical bars) */}
            <div className={`${styles.vChartContainer} ${animLeft(3)}`}>
              <div className={styles.chartTitle}>Member Growth (Monthly)</div>
              <div className={styles.vChartGrid}>
                {[
                  { label: 'Jul', value: 55 },
                  { label: 'Aug', value: 62 },
                  { label: 'Sep', value: 70 },
                  { label: 'Oct', value: 68 },
                  { label: 'Nov', value: 75 },
                  { label: 'Dec', value: 60 },
                  { label: 'Jan', value: 85 },
                  { label: 'Feb', value: 78 },
                  { label: 'Mar', value: 88 },
                  { label: 'Apr', value: 92 },
                  { label: 'May', value: 95 },
                  { label: 'Jun', value: 100 },
                ].map((col, i) => (
                  <div key={col.label} className={styles.vChartCol}>
                    <div
                      className={
                        i >= 10 ? styles.vChartBar : styles.vChartBarAlt
                      }
                      style={{
                        height: `${col.value}%`,
                        animationDelay: `${0.5 + i * 0.08}s`,
                      }}
                    />
                    <div className={styles.vChartLabel}>{col.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* PR Distribution (vertical bars) */}
            <div className={`${styles.vChartContainer} ${animRight(3)}`}>
              <div className={styles.chartTitle}>
                PR Records by Discipline
              </div>
              <div className={styles.vChartGrid}>
                {[
                  { label: 'Squat', value: 90 },
                  { label: 'Dead', value: 95 },
                  { label: 'Bench', value: 70 },
                  { label: 'Clean', value: 80 },
                  { label: 'Snatch', value: 65 },
                  { label: 'Jerk', value: 72 },
                  { label: 'Row', value: 55 },
                  { label: 'Run', value: 48 },
                ].map((col, i) => (
                  <div key={col.label} className={styles.vChartCol}>
                    <div
                      className={
                        col.value >= 80 ? styles.vChartBar : styles.vChartBarAlt
                      }
                      style={{
                        height: `${col.value}%`,
                        animationDelay: `${0.6 + i * 0.1}s`,
                      }}
                    />
                    <div className={styles.vChartLabel}>{col.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COACHES ===== */}
      <div className={`${styles.sectionDark} ${styles.sectionCoaches}`}>
        <section className={styles.sectionInner}>
          <div className={anim()}>
            <span className={styles.sectionLabel}>// Personnel</span>
            <h2 className={styles.sectionTitle}>
              Coaches<span className={styles.accent}> //</span>
            </h2>
          </div>
          <div className={styles.coachesGrid}>
            {[
              {
                name: 'Rex Dalton',
                role: 'Head Coach',
                bio: '15 years experience. CrossFit Games competitor. Builds athletes that last.',
                image: '/crossfit/image-20.jpg',
              },
              {
                name: 'Maria Santos',
                role: 'Olympic Lifting',
                bio: 'Former national team member. Specialist in clean & jerk, snatch technique.',
                image: '/crossfit/image-24.jpg',
              },
              {
                name: 'Jamal Wright',
                role: 'Endurance & Conditioning',
                bio: 'Ultramarathon runner. Designs programming that pushes aerobic limits.',
                image: '/crossfit/image-21.jpg',
              },
              {
                name: 'Kira Volkov',
                role: 'Mobility & Recovery',
                bio: 'Physical therapy background. Keeps you moving and injury-free.',
                image: '/crossfit/image-23.jpg',
              },
            ].map((coach, i) => (
              <div
                key={coach.name}
                className={`${styles.coachCard} ${anim((i + 1) as 1 | 2 | 3 | 4)}`}
              >
                <div className={styles.coachPhoto} style={{ backgroundImage: `url(${coach.image})` }}>
                  <span className={styles.coachPhotoLabel}>
                    [ Athlete Profile ]
                  </span>
                </div>
                <div className={styles.coachInfo}>
                  <div className={styles.coachName}>{coach.name}</div>
                  <div className={styles.coachRole}>{coach.role}</div>
                  <div className={styles.coachBio}>{coach.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <div className={styles.sectionTestimonials}>
      <section className={styles.section}>
        <div className={anim()}>
          <span className={styles.sectionLabel}>// Field Reports</span>
          <h2 className={styles.sectionTitle}>
            Results<span className={styles.accent}> //</span>
          </h2>
        </div>
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
          ].map((t, i) => (
            <div
              key={t.author}
              className={`${styles.testimonialItem} ${animLeft((i + 1) as 1 | 2 | 3)}`}
            >
              <div className={styles.testimonialQuote}>
                &ldquo;{t.quote}&rdquo;
              </div>
              <div className={styles.testimonialAuthor}>-- {t.author}</div>
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* ===== PRICING ===== */}
      <div className={`${styles.sectionDark} ${styles.sectionPricing}`}>
        <section className={styles.sectionInner}>
          <div className={anim()}>
            <span className={styles.sectionLabel}>// Access Tiers</span>
            <h2 className={styles.sectionTitle}>
              Pricing<span className={styles.accent}> //</span>
            </h2>
          </div>
          <div className={styles.pricingGrid}>
            <div className={`${styles.pricingCard} ${anim(1)}`}>
              <div className={styles.pricingLabel}>Tier 01</div>
              <div className={styles.pricingTier}>Drop-In</div>
              <div className={styles.pricingAmount}>$25</div>
              <span className={styles.pricingUnit}>/ single session</span>
              <ul className={styles.pricingSpecList}>
                <li className={styles.pricingSpec}>Any class</li>
                <li className={styles.pricingSpec}>Equipment included</li>
                <li className={styles.pricingSpec}>No commitment</li>
              </ul>
              <button className={styles.pricingBtn}>Select</button>
            </div>

            <div
              className={`${styles.pricingCard} ${styles.pricingFeatured} ${anim(2)}`}
            >
              <div className={styles.pricingTag}>Most Popular</div>
              <div className={styles.pricingLabel}>Tier 02</div>
              <div className={styles.pricingTier}>Monthly</div>
              <div className={styles.pricingAmount}>
                <span className={styles.pricingAmountAccent}>$149</span>
              </div>
              <span className={styles.pricingUnit}>/ month</span>
              <ul className={styles.pricingSpecList}>
                <li className={styles.pricingSpec}>3x classes per week</li>
                <li className={styles.pricingSpec}>Open gym access</li>
                <li className={styles.pricingSpec}>Progress tracking</li>
                <li className={styles.pricingSpec}>Community events</li>
              </ul>
              <button className={styles.pricingBtnFeatured}>Select</button>
            </div>

            <div className={`${styles.pricingCard} ${anim(3)}`}>
              <div className={styles.pricingLabel}>Tier 03</div>
              <div className={styles.pricingTier}>Unlimited</div>
              <div className={styles.pricingAmount}>$199</div>
              <span className={styles.pricingUnit}>/ month</span>
              <ul className={styles.pricingSpecList}>
                <li className={styles.pricingSpec}>Unlimited classes</li>
                <li className={styles.pricingSpec}>Priority booking</li>
                <li className={styles.pricingSpec}>1-on-1 monthly review</li>
                <li className={styles.pricingSpec}>Guest passes (2/mo)</li>
              </ul>
              <button className={styles.pricingBtn}>Select</button>
            </div>
          </div>
        </section>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerBrand}>Iron Republic</div>
            <div className={styles.footerTagline}>
              CrossFit // Austin, TX
            </div>
            <div className={styles.footerAddress}>
              1847 Industrial Blvd
              <br />
              Austin, TX
              <br />
              Mon-Fri 5AM-9PM
              <br />
              Sat 7AM-5PM | Sun 8AM-2PM
            </div>
          </div>
          <div>
            <div className={styles.footerHeading}>Programs</div>
            <ul className={styles.footerLinks}>
              <li>
                <span className={styles.footerLink}>WOD</span>
              </li>
              <li>
                <span className={styles.footerLink}>Olympic Lifting</span>
              </li>
              <li>
                <span className={styles.footerLink}>Endurance</span>
              </li>
              <li>
                <span className={styles.footerLink}>Mobility</span>
              </li>
              <li>
                <span className={styles.footerLink}>Open Gym</span>
              </li>
            </ul>
          </div>
          <div>
            <div className={styles.footerHeading}>Info</div>
            <ul className={styles.footerLinks}>
              <li>
                <span className={styles.footerLink}>About</span>
              </li>
              <li>
                <span className={styles.footerLink}>Coaches</span>
              </li>
              <li>
                <span className={styles.footerLink}>Pricing</span>
              </li>
              <li>
                <span className={styles.footerLink}>Schedule</span>
              </li>
              <li>
                <span className={styles.footerLink}>Contact</span>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>
            &copy; 2025 Iron Republic CrossFit. All rights reserved.
          </span>
          <span className={styles.footerCopy}>Forged in Austin.</span>
        </div>
      </footer>
    </div>
  );
}
