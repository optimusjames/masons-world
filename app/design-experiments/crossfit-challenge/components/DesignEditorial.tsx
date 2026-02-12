'use client';

import styles from './DesignEditorial.module.css';

export default function DesignEditorial() {
  return (
    <div className={styles.wrapper}>
      {/* ══ HERO ══ */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.heroLabel}>Est. 2018 -- Austin, Texas</span>
          <h1 className={styles.heroHeading}>
            IRON
            <br />
            REPUBLIC
            <span className={styles.heroHeadingItalic}>CrossFit</span>
          </h1>
          <p className={styles.heroSubtext}>
            Where grit meets grace. A community forged in sweat, built on
            purpose, and driven by the belief that strength is for everyone.
          </p>
          <button className={styles.heroCta}>
            Begin Your Story
            <span className={styles.heroCtaArrow}>&rarr;</span>
          </button>
          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              Members
              <span className={styles.heroMetaValue}>500+</span>
            </div>
            <div className={styles.heroMetaItem}>
              Classes Weekly
              <span className={styles.heroMetaValue}>40+</span>
            </div>
            <div className={styles.heroMetaItem}>
              Years Strong
              <span className={styles.heroMetaValue}>8</span>
            </div>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.heroImageOverlay} />
          <span className={styles.heroImageCaption}>
            The morning crew, 5:30 AM
          </span>
        </div>
      </section>

      {/* ══ CLASSES / SCHEDULE ══ */}
      <section className={styles.classes}>
        <div className={styles.classesLeft}>
          <span className={styles.sectionLabel}>Programming</span>
          <h2 className={styles.classesHeading}>
            Your
            <br />
            Training,
            <br />
            Curated.
          </h2>
          <p className={styles.classesIntro}>
            Every class is designed with intention. Whether you are chasing a PR
            or just starting out, our programming meets you exactly where you
            are.
          </p>
        </div>
        <div className={styles.schedule}>
          <div className={styles.scheduleHeader}>
            <span className={styles.scheduleTitle}>Class Offerings</span>
            <span className={styles.scheduleHours}>5 Disciplines</span>
          </div>

          <div className={styles.classRow}>
            <span className={styles.className}>Workout of the Day</span>
            <span className={styles.classTag}>Signature</span>
            <span className={styles.classArrow}>&rarr;</span>
          </div>
          <div className={styles.classRow}>
            <span className={styles.className}>Olympic Lifting</span>
            <span className={styles.classTag}>Strength</span>
            <span className={styles.classArrow}>&rarr;</span>
          </div>
          <div className={styles.classRow}>
            <span className={styles.className}>Endurance</span>
            <span className={styles.classTag}>Conditioning</span>
            <span className={styles.classArrow}>&rarr;</span>
          </div>
          <div className={styles.classRow}>
            <span className={styles.className}>Mobility</span>
            <span className={styles.classTag}>Recovery</span>
            <span className={styles.classArrow}>&rarr;</span>
          </div>
          <div className={styles.classRow}>
            <span className={styles.className}>Open Gym</span>
            <span className={styles.classTag}>Flex</span>
            <span className={styles.classArrow}>&rarr;</span>
          </div>

          <div className={styles.scheduleMeta}>
            <div className={styles.scheduleMetaBlock}>
              <span className={styles.scheduleMetaBlockLabel}>Weekdays</span>
              Mon -- Fri, 5AM -- 9PM
            </div>
            <div className={styles.scheduleMetaBlock}>
              <span className={styles.scheduleMetaBlockLabel}>Saturday</span>
              7AM -- 5PM
            </div>
            <div className={styles.scheduleMetaBlock}>
              <span className={styles.scheduleMetaBlockLabel}>Sunday</span>
              8AM -- 2PM
            </div>
          </div>
        </div>
      </section>

      {/* ══ COACHES ══ */}
      <section className={styles.coaches}>
        <div className={styles.coachesHeader}>
          <div>
            <span className={styles.sectionLabel}>The Team</span>
            <h2 className={styles.coachesHeading}>
              Meet the Coaches Behind the Iron
            </h2>
          </div>
          <p className={styles.coachesSubtext}>
            Our coaching staff brings decades of combined experience from
            competitive athletics, physical therapy, and a shared obsession with
            helping you become the strongest version of yourself.
          </p>
        </div>

        <div className={styles.coachesGrid}>
          <div className={styles.coachCard}>
            <div
              className={`${styles.coachImageBlock} ${styles.coachGradient1}`}
            />
            <div className={styles.coachInfo}>
              <p className={styles.coachRole}>Head Coach</p>
              <h3 className={styles.coachName}>Rex Dalton</h3>
              <p className={styles.coachBio}>
                15 years of experience. CrossFit Games competitor. Rex built Iron
                Republic from a single garage bay into Austin&apos;s most
                respected box.
              </p>
            </div>
          </div>

          <div className={styles.coachCard}>
            <div
              className={`${styles.coachImageBlock} ${styles.coachGradient2}`}
            />
            <div className={styles.coachInfo}>
              <p className={styles.coachRole}>Olympic Lifting</p>
              <h3 className={styles.coachName}>Maria Santos</h3>
              <p className={styles.coachBio}>
                Former national team member. Specialist in snatch and clean
                &amp; jerk technique.
              </p>
            </div>
          </div>

          <div className={styles.coachCard}>
            <div
              className={`${styles.coachImageBlock} ${styles.coachGradient3}`}
            />
            <div className={styles.coachInfo}>
              <p className={styles.coachRole}>Endurance &amp; Conditioning</p>
              <h3 className={styles.coachName}>Jamal Wright</h3>
              <p className={styles.coachBio}>
                Ultramarathon runner who brings relentless energy to every
                conditioning session.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.coachFourth}>
          <div className={styles.coachFourthInner}>
            <div
              className={`${styles.coachImageBlock} ${styles.coachGradient4}`}
              style={{ aspectRatio: '4 / 3' }}
            />
            <div className={styles.coachInfo}>
              <p className={styles.coachRole}>Mobility &amp; Recovery</p>
              <h3 className={styles.coachName}>Kira Volkov</h3>
              <p className={styles.coachBio}>
                Physical therapy background. Kira ensures you move well before
                you move heavy.
              </p>
            </div>
          </div>
          <div
            className={styles.coachImageBlock}
            style={{ aspectRatio: '16 / 9', borderRadius: 0, background: "url('/crossfit/image-22.png') center center / cover no-repeat" }}
          />
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className={styles.testimonials}>
        <div className={styles.testimonialsHeader}>
          <span className={styles.sectionLabel}>Voices</span>
          <h2 className={styles.testimonialsHeading}>
            Stories from the Community
          </h2>
        </div>

        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonialCard}>
            <span className={styles.quoteOpen}>&ldquo;</span>
            <p className={styles.testimonialText}>
              IRON REPUBLIC changed my life. Down 40lbs in 6 months. I walked in
              not knowing what a snatch was. Now I can&apos;t imagine a morning
              without the barbell.
            </p>
            <div className={styles.testimonialDivider} />
            <span className={styles.testimonialAuthor}>Derek M.</span>
          </div>

          <div className={styles.testimonialCard}>
            <span className={styles.quoteOpen}>&ldquo;</span>
            <p className={styles.testimonialText}>
              The coaches push you past what you thought possible. Every single
              session, they see something in you that you haven&apos;t found
              yet.
            </p>
            <div className={styles.testimonialDivider} />
            <span className={styles.testimonialAuthor}>Sarah K.</span>
          </div>

          <div className={styles.testimonialCard}>
            <span className={styles.quoteOpen}>&ldquo;</span>
            <p className={styles.testimonialText}>
              Best community in Austin. Period. I came for the workouts. I stayed
              for the people who became family.
            </p>
            <div className={styles.testimonialDivider} />
            <span className={styles.testimonialAuthor}>Tommy R.</span>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className={styles.pricing}>
        <div className={styles.pricingInner}>
          <div className={styles.pricingLeft}>
            <span className={styles.pricingLabel}>Membership</span>
            <h2 className={styles.pricingHeading}>
              Invest in
              <br />
              Yourself
            </h2>
            <p className={styles.pricingSubtext}>
              No contracts. No gimmicks. Just honest training with people who
              give a damn. Start with a drop-in or go all in.
            </p>
            <button className={styles.pricingCta}>
              Start Your Free Trial &rarr;
            </button>
          </div>

          <div className={styles.pricingOptions}>
            <div className={styles.pricingCard}>
              <div>
                <h3 className={styles.pricingTier}>Drop-In</h3>
                <p className={styles.pricingDescription}>
                  Visiting Austin or want to test the waters? Single class
                  access, full experience. No commitment required.
                </p>
              </div>
              <div className={styles.pricingAmount}>
                $25
                <span className={styles.pricingPer}>per class</span>
              </div>
            </div>

            <div className={styles.pricingCard}>
              <div>
                <h3 className={styles.pricingTier}>Monthly</h3>
                <p className={styles.pricingDescription}>
                  Three classes per week. The foundation. Enough structure to
                  build momentum and start seeing results.
                </p>
              </div>
              <div className={styles.pricingAmount}>
                $149
                <span className={styles.pricingPer}>per month</span>
              </div>
            </div>

            <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
              <div>
                <span className={styles.pricingFeaturedLabel}>
                  Most Popular
                </span>
                <h3 className={styles.pricingTier}>Unlimited</h3>
                <p className={styles.pricingDescription}>
                  All classes. Open gym. Priority booking. Community events. This
                  is for those who are all in.
                </p>
              </div>
              <div className={styles.pricingAmount}>
                $199
                <span className={styles.pricingPer}>per month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <h3 className={styles.footerBrand}>
              IRON{' '}
              <span className={styles.footerBrandAccent}>Republic</span>
            </h3>
            <p className={styles.footerTagline}>
              Where the iron meets intention,
              <br />
              and every rep tells a story.
            </p>
            <address className={styles.footerAddress}>
              1847 Industrial Blvd
              <br />
              Austin, TX
            </address>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Training</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="#" className={styles.footerLink}>WOD</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Olympic Lifting</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Endurance</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Mobility</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Open Gym</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Community</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="#" className={styles.footerLink}>Our Story</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Coaches</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Events</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Blog</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.footerColTitle}>Visit</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="#" className={styles.footerLink}>Schedule</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Pricing</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Free Trial</a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>Contact</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>
            2025 Iron Republic CrossFit. All rights reserved.
          </span>
          <div className={styles.footerSocials}>
            <a href="#" className={styles.footerSocial}>Instagram</a>
            <a href="#" className={styles.footerSocial}>YouTube</a>
            <a href="#" className={styles.footerSocial}>Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
