'use client';

import { useEffect, useRef, useCallback } from 'react';
import styles from './DesignEditorialV2.module.css';

function useScrollReveal() {
  const refs = useRef<(HTMLElement | null)[]>([]);

  const setRef = useCallback((index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            // Add visible class based on which reveal class the element has
            if (el.classList.contains(styles.reveal)) {
              el.classList.add(styles.revealVisible);
            }
            if (el.classList.contains(styles.revealLeft)) {
              el.classList.add(styles.revealLeftVisible);
            }
            if (el.classList.contains(styles.revealRight)) {
              el.classList.add(styles.revealRightVisible);
            }
            // Animate ring fills
            el.querySelectorAll(`.${styles.ringFill}`).forEach((ring) => {
              ring.classList.add(styles.ringFillAnimated);
            });
            // Animate ring centers
            el.querySelectorAll(`.${styles.ringCenter}`).forEach((center) => {
              center.classList.add(styles.ringCenterVisible);
            });
            // Animate impact values
            el.querySelectorAll(`.${styles.impactValue}`).forEach((val) => {
              val.classList.add(styles.impactValueVisible);
            });
            // Animate testimonial dividers
            el.querySelectorAll(`.${styles.testimonialDivider}`).forEach((div) => {
              div.classList.add(styles.testimonialDividerVisible);
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return setRef;
}

// SVG ring chart helper
function RingChart({
  percent,
  centerText,
}: {
  percent: number;
  label?: string;
  centerText: string;
}) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={styles.ringChart}>
      <svg
        className={styles.ringChartSvg}
        viewBox="0 0 120 120"
      >
        <circle className={styles.ringBg} cx="60" cy="60" r={radius} />
        <circle
          className={styles.ringFill}
          cx="60"
          cy="60"
          r={radius}
          style={
            {
              '--circumference': `${circumference}`,
              '--offset': `${offset}`,
            } as React.CSSProperties
          }
        />
      </svg>
      <span className={styles.ringCenter}>{centerText}</span>
    </div>
  );
}

export default function DesignEditorialV2() {
  const setRef = useScrollReveal();
  let refIndex = 0;

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
        <div
          className={`${styles.classesLeft} ${styles.revealLeft}`}
          ref={setRef(refIndex++)}
        >
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
        <div
          className={`${styles.schedule} ${styles.revealRight}`}
          ref={setRef(refIndex++)}
        >
          <div className={styles.scheduleHeader}>
            <span className={styles.scheduleTitle}>Class Offerings</span>
            <span className={styles.scheduleHours}>5 Disciplines</span>
          </div>

          {[
            { name: 'Workout of the Day', tag: 'Signature' },
            { name: 'Olympic Lifting', tag: 'Strength' },
            { name: 'Endurance', tag: 'Conditioning' },
            { name: 'Mobility', tag: 'Recovery' },
            { name: 'Open Gym', tag: 'Flex' },
          ].map((cls) => (
            <div className={styles.classRow} key={cls.name}>
              <span className={styles.className}>{cls.name}</span>
              <span className={styles.classTag}>{cls.tag}</span>
              <span className={styles.classArrow}>&rarr;</span>
            </div>
          ))}

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
        <div
          className={`${styles.coachesHeader} ${styles.reveal}`}
          ref={setRef(refIndex++)}
        >
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

        <div
          className={`${styles.coachesGrid} ${styles.reveal}`}
          ref={setRef(refIndex++)}
        >
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

        <div
          className={`${styles.coachFourth} ${styles.reveal} ${styles.stagger2}`}
          ref={setRef(refIndex++)}
        >
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
            className={styles.coachFourthImage}
            style={{ aspectRatio: '16 / 9' }}
          />
        </div>
      </section>

      {/* ══ COMMUNITY IMPACT -- data viz ══ */}
      <section className={styles.impact}>
        <div
          className={`${styles.impactHeader} ${styles.reveal}`}
          ref={setRef(refIndex++)}
        >
          <span className={styles.sectionLabel}>By The Numbers</span>
          <h2 className={styles.impactHeading}>Community Impact</h2>
          <p className={styles.impactSubtext}>
            Eight years of building something bigger than a gym. These numbers
            tell the story of a community that shows up, puts in the work, and
            lifts each other higher.
          </p>
        </div>

        <div
          className={`${styles.impactGrid} ${styles.reveal}`}
          ref={setRef(refIndex++)}
        >
          <div className={styles.impactCard}>
            <RingChart percent={83} label="Members" centerText="83%" />
            <div className={styles.impactValue}>2,847</div>
            <span className={styles.impactLabel}>Members Trained</span>
            <span className={styles.impactDescription}>
              Since opening day. 83% retention rate year over year.
            </span>
          </div>

          <div className={styles.impactCard}>
            <RingChart percent={92} label="Classes" centerText="92%" />
            <div className={styles.impactValue}>18,400+</div>
            <span className={styles.impactLabel}>Classes Held</span>
            <span className={styles.impactDescription}>
              92% average capacity across all time slots.
            </span>
          </div>

          <div className={styles.impactCard}>
            <RingChart percent={76} label="Strength" centerText="76%" />
            <div className={styles.impactValue}>4.2M</div>
            <span className={styles.impactLabel}>Pounds Lifted</span>
            <span className={styles.impactDescription}>
              Collective weight moved in 2025 alone. 76% increase from year one.
            </span>
          </div>

          <div className={styles.impactCard}>
            <RingChart percent={95} label="Events" centerText="95%" />
            <div className={styles.impactValue}>156</div>
            <span className={styles.impactLabel}>Community Events</span>
            <span className={styles.impactDescription}>
              Competitions, fundraisers, and social gatherings. 95% member participation.
            </span>
          </div>
        </div>

        <div
          className={`${styles.impactBar} ${styles.reveal} ${styles.stagger3}`}
          ref={setRef(refIndex++)}
        >
          <div className={styles.impactBarItem}>
            <span className={styles.impactBarValue}>4.9</span>
            <span className={styles.impactBarLabel}>Average Rating</span>
          </div>
          <div className={styles.impactBarItem}>
            <span className={styles.impactBarValue}>12</span>
            <span className={styles.impactBarLabel}>Certified Coaches</span>
          </div>
          <div className={styles.impactBarItem}>
            <span className={styles.impactBarValue}>15K</span>
            <span className={styles.impactBarLabel}>Sq Ft Facility</span>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className={styles.testimonials}>
        <div
          className={`${styles.testimonialsHeader} ${styles.reveal}`}
          ref={setRef(refIndex++)}
        >
          <span className={styles.sectionLabel}>Voices</span>
          <h2 className={styles.testimonialsHeading}>
            Stories from the Community
          </h2>
        </div>

        <div
          className={`${styles.testimonialsGrid} ${styles.reveal}`}
          ref={setRef(refIndex++)}
        >
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
          <div
            className={`${styles.pricingLeft} ${styles.revealLeft}`}
            ref={setRef(refIndex++)}
          >
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

          <div
            className={`${styles.pricingOptions} ${styles.revealRight}`}
            ref={setRef(refIndex++)}
          >
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

            <div
              className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}
            >
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
