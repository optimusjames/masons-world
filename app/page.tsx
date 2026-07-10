import Image from "next/image";
import CurtainLink from "./components/CurtainLink";
import SiteFooter from "./components/SiteFooter";
import NetworkCanvas from "./components/NetworkCanvas";
import { getAllPosts } from "@/lib/blog/loadBlog";
import { getAllRecommendations } from "@/app/(blog)/recommended/loadRecommended";
import { experiments } from "@/lib/experiments/data";

import Greeting from "./components/Greeting";
import ShakeCard from "./components/ShakeCard";
import styles from "./page.module.css";

// The three map projects, in chronological order so they read left-to-right as a
// progression. Each carries a short blurb and one concrete impact/scope line
// (the data.ts descriptions run long, and the shared tags say nothing new).
const FEATURED = [
  {
    slug: "mcloughlin-99e",
    blurb: "A scrollytelling case study of a real 3-year campaign to slow a corridor still engineered like a 1930s superhighway.",
    scope: "3 yrs with ODOT & PBOT · 2 → 4 mile speed reduction",
  },
  {
    slug: "fixit-pdx",
    blurb: "A friction-free reimagining of Portland's issue reporter — one map to flag a pothole, streetlight, or graffiti, and see what's already fixed.",
    scope: "No login · 12 issue types · report in two taps",
  },
  {
    slug: "cool-pdx",
    blurb: "On a hot day, find the nearest shade, water, and air-conditioned refuge — all drawn from Portland's public open data.",
    scope: "Built from 253,951 city street trees",
  },
];

const caret = (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default async function Home() {
  const bySlug = new Map(experiments.map((e) => [e.slug, e]));
  const featured = FEATURED.map((f) => ({ ...bySlug.get(f.slug)!, blurb: f.blurb, scope: f.scope }));
  const posts = getAllPosts().slice(0, 3);
  const recentExplores = (await getAllRecommendations()).slice(0, 3);

  return (
    <main className={styles.mainContainer}>
      <NetworkCanvas className={styles.networkBg} />
      <div className={styles.ambientGlow} />
      <div className={styles.contentOverlay}>
        <div className={styles.content}>
          {/* Hero — greeting flourish + contained identity */}
          <header className={styles.hero}>
            <Greeting className={styles.greeting} />
            <div className={styles.identityCard}>
              <div className={styles.avatar}>
                <Image
                  src="/james-headshot.jpg"
                  alt="James Mason"
                  width={160}
                  height={160}
                  sizes="80px"
                  className={styles.avatarImg}
                  priority
                />
              </div>
              <div className={styles.identityText}>
                <h1 className={styles.name}>James Mason</h1>
                <p className={styles.role}>Civic data &amp; maps · Portland, OR</p>
                <p className={styles.tagline}>
                  I turn public data into interactive maps and tools people actually use.
                </p>
                <div className={styles.identityLinks}>
                  <a href="https://github.com/optimusjames" target="_blank" rel="noopener noreferrer" className={styles.identityLink}>GitHub</a>
                  <a href="https://www.linkedin.com/in/optimizationmason/" target="_blank" rel="noopener noreferrer" className={styles.identityLink}>LinkedIn</a>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Work — the three map projects */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Featured Work</span>
              <h2 className={styles.sectionTitle}>Civic maps, built on Portland&apos;s open data.</h2>
              <CurtainLink href="/design-experiments" className={styles.sectionLink} curtainTransition={true}>
                All designs {caret}
              </CurtainLink>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((exp) => (
                <CurtainLink
                  key={exp.slug}
                  href={`/design-experiments/${exp.slug}`}
                  className={styles.featuredCard}
                  curtainTransition={true}
                >
                  {exp.screenshot && (
                    <Image
                      src={exp.screenshot}
                      alt={exp.title}
                      width={480}
                      height={270}
                      sizes="(max-width: 830px) 100vw, 300px"
                      className={styles.featuredThumb}
                    />
                  )}
                  <div className={styles.featuredText}>
                    <span className={styles.featuredCardTitle}>{exp.title}</span>
                    <span className={styles.featuredBlurb}>{exp.blurb}</span>
                    <span className={styles.featuredScope}>{exp.scope}</span>
                  </div>
                </CurtainLink>
              ))}
            </div>
          </section>

          {/* Secondary — Writing + Recommendations */}
          <section className={styles.secondary}>
            <div className={styles.subsection}>
              <div className={styles.subsectionHead}>
                <div className={styles.subsectionTitleRow}>
                  <CurtainLink href="/blog" className={styles.eyebrowLink} curtainTransition={true}>
                    Writing {caret}
                  </CurtainLink>
                  <span className={styles.experimentTag}>✦ an experiment</span>
                </div>
                <span className={styles.subsectionMeta}>Philosophy · Mindset · Tech</span>
              </div>
              <div className={styles.rows}>
                {posts.map((post) => (
                  <ShakeCard key={post.slug} className={styles.row}>
                    <CurtainLink href={`/blog/${post.slug}`} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }} curtainTransition={true}>
                      {post.image && (
                        <Image src={post.image} alt={post.title} width={200} height={150} sizes="88px" className={styles.rowThumb} />
                      )}
                      <div className={styles.rowText}>
                        <span className={styles.rowTitle}>{post.title}</span>
                        {post.subtitle && <span className={styles.rowSnippet}>{post.subtitle}</span>}
                        {post.date && (
                          <span className={styles.rowDate}>
                            {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </CurtainLink>
                  </ShakeCard>
                ))}
              </div>
            </div>

            <div className={styles.subsection}>
              <div className={styles.subsectionHead}>
                <CurtainLink href="/recommended" className={styles.eyebrowLink} curtainTransition={true}>
                  Finds {caret}
                </CurtainLink>
                <span className={styles.subsectionMeta}>Reads · Watches · Rabbit Holes</span>
              </div>
              <div className={styles.rows}>
                {recentExplores.map((item) => (
                  <ShakeCard key={item.id} className={styles.row}>
                    <CurtainLink href="/recommended" style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }} curtainTransition={true}>
                      {item.thumbnail && (
                        <Image src={item.thumbnail} alt={item.title} width={200} height={150} sizes="88px" className={styles.rowThumb} />
                      )}
                      <div className={styles.rowText}>
                        <span className={styles.rowTitle}>{item.title}</span>
                        <span className={styles.rowDate}>
                          {new Date(`${item.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </CurtainLink>
                  </ShakeCard>
                ))}
              </div>
            </div>
          </section>

          <SiteFooter className={styles.homeFooter} />
        </div>
      </div>
    </main>
  );
}
