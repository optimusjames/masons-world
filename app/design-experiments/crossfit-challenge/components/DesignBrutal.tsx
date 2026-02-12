'use client';

import styles from './DesignBrutal.module.css';

export default function DesignBrutal() {
  return (
    <div className={styles.wrapper}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroDiagonal} />
        <div className={styles.heroContent}>
          <span className={styles.heroLabel}>EST. 2019 // Austin, TX</span>
          <h1 className={styles.heroTitle}>
            IRON<br />
            <span className={styles.accent}>REPUBLIC</span>
          </h1>
          <p className={styles.heroSubtitle}>CrossFit</p>
          <hr className={styles.heroRule} />
          <button className={styles.heroCta}>Start Your Trial</button>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.heroMetaLine}>1847 Industrial Blvd</span>
          <span className={styles.heroMetaLine}>Austin, TX</span>
          <span className={styles.heroMetaLine}>Mon-Fri 5AM-9PM</span>
        </div>
      </section>

      {/* ===== CLASSES / SCHEDULE ===== */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Classes<span className={styles.accent}> //</span>
        </h2>
        <div className={styles.classesGrid}>
          {[
            { name: 'WOD', meta: 'High Intensity', idx: '01' },
            { name: 'Olympic Lifting', meta: 'Strength / Power', idx: '02' },
            { name: 'Endurance', meta: 'Cardio / Stamina', idx: '03' },
            { name: 'Mobility', meta: 'Recovery / Flex', idx: '04' },
            { name: 'Open Gym', meta: 'Self-Directed', idx: '05' },
          ].map((c) => (
            <div key={c.idx} className={styles.classCard}>
              <div className={styles.classIndex}>{c.idx}</div>
              <div className={styles.className}>{c.name}</div>
              <div className={styles.classMeta}>{c.meta}</div>
            </div>
          ))}
        </div>

        <div className={styles.scheduleBar}>
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

      {/* ===== COACHES ===== */}
      <div className={styles.sectionDark}>
        <section className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>
            Coaches<span className={styles.accent}> //</span>
          </h2>
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
            ].map((coach) => (
              <div key={coach.name} className={styles.coachCard}>
                <div className={styles.coachPhoto} style={{ backgroundImage: `url(${coach.image})` }}>
                  <span className={styles.coachPhotoLabel}>[ Athlete Profile ]</span>
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
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Results<span className={styles.accent}> //</span>
        </h2>
        <div className={styles.testimonialsList}>
          <div className={styles.testimonialItem}>
            <div className={styles.testimonialQuote}>
              &ldquo;IRON REPUBLIC changed my life. Down 40lbs in 6 months.&rdquo;
            </div>
            <div className={styles.testimonialAuthor}>-- Derek M.</div>
          </div>
          <div className={styles.testimonialItem}>
            <div className={styles.testimonialQuote}>
              &ldquo;The coaches push you past what you thought possible.&rdquo;
            </div>
            <div className={styles.testimonialAuthor}>-- Sarah K.</div>
          </div>
          <div className={styles.testimonialItem}>
            <div className={styles.testimonialQuote}>
              &ldquo;Best community in Austin. Period.&rdquo;
            </div>
            <div className={styles.testimonialAuthor}>-- Tommy R.</div>
          </div>
        </div>
      </section>

      {/* ===== PRICING / CTA ===== */}
      <div className={styles.sectionDark}>
        <section className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>
            Pricing<span className={styles.accent}> //</span>
          </h2>
          <div className={styles.pricingGrid}>
            {/* Drop-in */}
            <div className={styles.pricingCard}>
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

            {/* Monthly */}
            <div className={`${styles.pricingCard} ${styles.pricingFeatured}`}>
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

            {/* Unlimited */}
            <div className={styles.pricingCard}>
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
            <div className={styles.footerTagline}>CrossFit // Austin, TX</div>
            <div className={styles.footerAddress}>
              1847 Industrial Blvd<br />
              Austin, TX<br />
              Mon-Fri 5AM-9PM<br />
              Sat 7AM-5PM | Sun 8AM-2PM
            </div>
          </div>
          <div>
            <div className={styles.footerHeading}>Programs</div>
            <ul className={styles.footerLinks}>
              <li><span className={styles.footerLink}>WOD</span></li>
              <li><span className={styles.footerLink}>Olympic Lifting</span></li>
              <li><span className={styles.footerLink}>Endurance</span></li>
              <li><span className={styles.footerLink}>Mobility</span></li>
              <li><span className={styles.footerLink}>Open Gym</span></li>
            </ul>
          </div>
          <div>
            <div className={styles.footerHeading}>Info</div>
            <ul className={styles.footerLinks}>
              <li><span className={styles.footerLink}>About</span></li>
              <li><span className={styles.footerLink}>Coaches</span></li>
              <li><span className={styles.footerLink}>Pricing</span></li>
              <li><span className={styles.footerLink}>Schedule</span></li>
              <li><span className={styles.footerLink}>Contact</span></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>
            &copy; 2025 Iron Republic CrossFit. All rights reserved.
          </span>
          <span className={styles.footerCopy}>
            Forged in Austin.
          </span>
        </div>
      </footer>
    </div>
  );
}
