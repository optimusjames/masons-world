'use client'

import styles from './DesignTechDataV2.module.css'

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

const weeklyAttendance = [32, 38, 41, 36, 45, 48, 42, 52, 55, 50, 58, 62]
const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12']

const classPopularity = [
  { name: 'WOD', members: 187, pct: 92 },
  { name: 'Oly Lifting', members: 134, pct: 66 },
  { name: 'Endurance', members: 112, pct: 55 },
  { name: 'Mobility', members: 89, pct: 44 },
  { name: 'Open Gym', members: 76, pct: 37 },
]

const radialMetrics = [
  { label: 'Retention', value: 98, color: '#22c55e' },
  { label: 'Capacity', value: 84, color: '#06b6d4' },
  { label: 'Satisfaction', value: 97, color: '#6366f1' },
]

const plans = [
  {
    name: 'Drop-in',
    price: '$25',
    period: '/ visit',
    popular: false,
    features: [
      { text: 'Facility Access', included: true },
      { text: '1 Group Class', included: true },
      { text: 'Open Gym', included: false },
      { text: 'Coach Programming', included: false },
      { text: 'InBody Scans', included: false },
      { text: 'Nutrition Consult', included: false },
      { text: 'Guest Passes', included: false },
    ],
  },
  {
    name: 'Unlimited',
    price: '$199',
    period: '/ mo',
    popular: true,
    features: [
      { text: 'Facility Access', included: true },
      { text: 'Unlimited Classes', included: true },
      { text: 'Open Gym', included: true },
      { text: 'Coach Programming', included: true },
      { text: 'Bi-weekly InBody Scans', included: true },
      { text: 'Nutrition Consult', included: true },
      { text: '4 Guest Passes / mo', included: true },
    ],
  },
  {
    name: 'Monthly',
    price: '$149',
    period: '/ mo',
    popular: false,
    features: [
      { text: 'Facility Access', included: true },
      { text: '12 Classes / mo', included: true },
      { text: 'Open Gym', included: true },
      { text: 'Coach Programming', included: false },
      { text: 'Monthly InBody Scan', included: true },
      { text: 'Nutrition Consult', included: false },
      { text: '1 Guest Pass / mo', included: true },
    ],
  },
]

function LineChart() {
  const maxVal = Math.max(...weeklyAttendance)
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const w = 600
  const h = 200
  const chartW = w - padding.left - padding.right
  const chartH = h - padding.top - padding.bottom

  const points = weeklyAttendance.map((val, i) => ({
    x: padding.left + (i / (weeklyAttendance.length - 1)) * chartW,
    y: padding.top + chartH - (val / (maxVal * 1.15)) * chartH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const y = padding.top + chartH * (1 - pct)
    const val = Math.round(maxVal * 1.15 * pct)
    return { y, val }
  })

  return (
    <svg className={styles.lineChart} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((g) => (
        <g key={g.val}>
          <line
            className={styles.lineChart + ' ' + styles.lineChart}
            x1={padding.left}
            y1={g.y}
            x2={w - padding.right}
            y2={g.y}
            stroke="rgba(99,102,241,0.08)"
            strokeWidth="1"
          />
          <text
            className="valueLabel"
            x={padding.left - 8}
            y={g.y + 3}
            textAnchor="end"
            fill="#475569"
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            {g.val}
          </text>
        </g>
      ))}

      <path d={areaPath} fill="url(#areaGradient)" className={styles.lineChart}>
        <animate attributeName="opacity" from="0" to="0.15" dur="2s" fill="freeze" />
      </path>

      <path
        d={linePath}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1000"
        strokeDashoffset="1000"
      >
        <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="2.5s" fill="freeze" begin="0.3s" />
      </path>

      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.5"
          fill="#6366f1"
          stroke="#0f172a"
          strokeWidth="2"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            from="0"
            to="1"
            dur="0.3s"
            fill="freeze"
            begin={`${0.3 + (i * 2.2) / weeklyAttendance.length}s`}
          />
        </circle>
      ))}

      {weekLabels.map((label, i) => {
        const x = padding.left + (i / (weekLabels.length - 1)) * chartW
        return (
          <text
            key={label}
            x={x}
            y={h - 6}
            textAnchor="middle"
            fill="#475569"
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

function RadialProgress({
  value,
  color,
  label,
}: {
  value: number
  color: string
  label: string
}) {
  const r = 40
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={styles.radialCard}>
      <svg
        className={styles.radialSvg}
        viewBox="0 0 100 100"
      >
        <circle className={styles.radialBg} cx="50" cy="50" r={r} />
        <circle
          className={styles.radialFill}
          cx="50"
          cy="50"
          r={r}
          stroke={color}
          style={
            {
              strokeDasharray: circumference,
              strokeDashoffset: circumference,
              '--circumference': circumference,
              '--dash-offset': offset,
            } as React.CSSProperties
          }
        />
      </svg>
      <span className={styles.radialValue}>{value}%</span>
      <span className={styles.radialLabel}>{label}</span>
    </div>
  )
}

export default function DesignTechDataV2() {
  return (
    <div className={styles.wrapper}>
      {/* Topbar */}
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
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            Live
          </div>
          <button className={styles.navCta}>Start Trial</button>
        </nav>
      </header>

      {/* Hero */}
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

      {/* Analytics Dashboard */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Analytics</span>
          <h2 className={styles.sectionTitle}>Performance Dashboard</h2>
        </div>

        <div className={styles.analyticsGrid}>
          {/* Line Chart - Attendance */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Weekly Class Attendance</h3>
              <div className={styles.chartBadge}>
                <span className={styles.chartBadgeDot} />
                Live Data
              </div>
            </div>
            <LineChart />
          </div>

          {/* Bar Chart - Class Popularity */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Class Popularity</h3>
              <div className={styles.chartBadge}>
                <span className={styles.chartBadgeDot} />
                This Month
              </div>
            </div>
            <div className={styles.barChartContainer}>
              {classPopularity.map((cls) => (
                <div key={cls.name} className={styles.barItem}>
                  <div className={styles.barLabel}>
                    <span className={styles.barName}>{cls.name}</span>
                    <span className={styles.barValue}>{cls.members}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${cls.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radial Metrics */}
        <div className={styles.radialGrid}>
          {radialMetrics.map((m) => (
            <RadialProgress
              key={m.label}
              value={m.value}
              color={m.color}
              label={m.label}
            />
          ))}
        </div>
      </section>

      <hr className={styles.divider} />

      {/* Schedule */}
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

      {/* Coaches */}
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
                <div className={styles.coachPhotoScanline} />
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

      {/* Testimonials */}
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

      {/* Pricing */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Plans</span>
          <h2 className={styles.sectionTitle}>Membership Comparison</h2>
        </div>

        <div className={styles.pricingGrid}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`${styles.pricingCard} ${
                plan.popular ? styles.pricingCardPopular : ''
              }`}
            >
              <div className={styles.planHeader}>
                <div className={styles.planName}>
                  {plan.name}
                  {plan.popular && (
                    <span className={styles.popularBadge}>Popular</span>
                  )}
                </div>
                <div className={styles.planPrice}>
                  {plan.price}
                  <span> {plan.period}</span>
                </div>
              </div>

              <ul className={styles.planFeatures}>
                {plan.features.map((f) => (
                  <li key={f.text} className={styles.planFeature}>
                    {f.included ? (
                      <span className={styles.featureCheck}>&#10003;</span>
                    ) : (
                      <span className={styles.featureDash}>&mdash;</span>
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>

              <button
                className={`${styles.planBtn} ${
                  plan.popular ? styles.planBtnPopular : ''
                }`}
              >
                {plan.popular ? 'Get Started' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        <p className={styles.pricingNote}>
          No contracts. Cancel anytime. 7-day free trial on all plans.
        </p>
      </section>

      {/* Footer */}
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
