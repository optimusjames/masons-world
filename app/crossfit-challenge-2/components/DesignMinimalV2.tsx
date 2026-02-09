'use client';

import { useEffect, useState } from 'react';
import styles from './DesignMinimalV2.module.css';

const membershipData = [
  { month: 'Jan', value: 84 },
  { month: 'Feb', value: 97 },
  { month: 'Mar', value: 112 },
  { month: 'Apr', value: 128 },
  { month: 'May', value: 143 },
  { month: 'Jun', value: 161 },
  { month: 'Jul', value: 178 },
  { month: 'Aug', value: 195 },
  { month: 'Sep', value: 210 },
  { month: 'Oct', value: 234 },
  { month: 'Nov', value: 251 },
  { month: 'Dec', value: 276 },
];

function MembershipChart({ visible }: { visible: boolean }) {
  const padding = { top: 30, right: 30, bottom: 40, left: 45 };
  const width = 900;
  const height = 300;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minVal = 50;
  const maxVal = 300;

  const points = membershipData.map((d, i) => ({
    x: padding.left + (i / (membershipData.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const gridLines = [100, 150, 200, 250];

  return (
    <div className={styles.chartContainer}>
      <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {gridLines.map((val) => {
          const y = padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
          return (
            <g key={val}>
              <line className={styles.chartGridLine} x1={padding.left} y1={y} x2={width - padding.right} y2={y} />
              <text className={styles.chartAxisLabel} x={padding.left - 10} y={y + 3} textAnchor="end">
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {visible && (
          <path className={styles.chartArea} d={areaPath} fill="url(#areaGradient)" />
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Line */}
        {visible && (
          <path
            className={`${styles.chartLine} ${styles.chartLineAnimated}`}
            d={linePath}
          />
        )}

        {/* Dots and labels */}
        {points.map((p, i) => (
          <g key={p.month}>
            {visible && (
              <circle
                className={`${styles.chartDot} ${styles.chartDotAnimated}`}
                cx={p.x}
                cy={p.y}
                r={3}
                style={{ animationDelay: `${1.6 + i * 0.08}s` }}
              />
            )}
            {/* Month labels */}
            <text className={styles.chartAxisLabel} x={p.x} y={height - 8} textAnchor="middle">
              {p.month}
            </text>
            {/* Value labels on select points */}
            {(i === 0 || i === 5 || i === 11) && visible && (
              <text
                className={styles.chartValueLabel}
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                style={{ animationDelay: `${2.2 + i * 0.05}s` }}
              >
                {p.value}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function DesignMinimalV2() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const reveal = (delay?: string) =>
    `${styles.section} ${mounted ? styles.sectionVisible : ''} ${delay || ''}`.trim();

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
      <section className={`${styles.classes} ${reveal(styles.delay1)}`}>
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
      <section className={`${styles.coaches} ${reveal(styles.delay2)}`}>
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

      {/* Membership Growth */}
      <section className={`${styles.growth} ${reveal(styles.delay3)}`}>
        <div className={styles.inner}>
          <p className={styles.sectionLabel}>Membership Growth</p>
          <MembershipChart visible={mounted} />
          <div className={styles.chartStats}>
            <div className={styles.chartStat}>
              <span className={styles.chartStatValue}>276</span>
              <span className={styles.chartStatLabel}>Active Members</span>
            </div>
            <div className={styles.chartStat}>
              <span className={styles.chartStatValue}>229%</span>
              <span className={styles.chartStatLabel}>Year-over-Year</span>
            </div>
            <div className={styles.chartStat}>
              <span className={styles.chartStatValue}>96%</span>
              <span className={styles.chartStatLabel}>Retention Rate</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.divider} />

      {/* Testimonials */}
      <section className={`${styles.testimonials} ${reveal(styles.delay4)}`}>
        <div className={styles.inner}>
          <p className={styles.sectionLabel}>Words</p>

          <div className={styles.testimonialsList}>
            {[
              {
                quote: 'IRON REPUBLIC changed my life. Down 40lbs in 6 months.',
                author: 'Derek M.',
              },
              {
                quote: 'The coaches push you past what you thought possible.',
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
      <section className={`${styles.pricing} ${reveal(styles.delay5)}`}>
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
