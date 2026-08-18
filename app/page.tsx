import Image from "next/image";
import CurtainLink from "./components/CurtainLink";
import SiteFooter from "./components/SiteFooter";
import NetworkCanvas from "./components/NetworkCanvas";
import { getAllPosts } from "@/lib/blog/loadBlog";
import { getAllRecommendations } from "@/app/(blog)/recommended/loadRecommended";
import { experiments } from "@/lib/experiments/data";

import Greeting from "./components/Greeting";
import HomeNav from "./components/HomeNav";
import IdentityCard from "./components/IdentityCard";
import LiveData from "./components/LiveData";
import ShakeCard from "./components/ShakeCard";
import styles from "./page.module.css";

// The civic maps, newest first, derived rather than hardcoded: ship a new one
// and it leads this section automatically. Scoped to Civic & Data on purpose,
// since the section heading makes a claim about Portland's open data and a new
// yoga experiment must never land here just for being recent.
//
// Blurb and scope live on each experiment in data.ts. The fallback keeps a map
// that forgot them presentable instead of blank.
const FEATURED_CATEGORY = "Civic & Data";
const FEATURED_COUNT = 4; // one lead + three trailing

function firstSentence(text: string): string {
  const end = text.indexOf(". ");
  return end === -1 ? text : text.slice(0, end + 1);
}

const featuredMaps = experiments
  .filter((e) => e.category === FEATURED_CATEGORY && e.screenshot)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, FEATURED_COUNT)
  .map((e) => ({
    ...e,
    blurb: e.blurb ?? firstSentence(e.description),
    scope: e.scope ?? e.tags.slice(0, 3).join(" · "),
  }));

const caret = (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default async function Home() {
  const [lead, ...trailing] = featuredMaps;
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
            <div className={styles.heroTop}>
              <Greeting className={styles.greeting} />
              <HomeNav />
            </div>
            <div className={styles.heroBody}>
              <IdentityCard />
              <LiveData />
            </div>
          </header>

          {/* Featured Work — the three map projects */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <CurtainLink href="/design-experiments" className={styles.eyebrow} curtainTransition={true}>Featured Work</CurtainLink>
              <h2 className={styles.sectionTitle}>Civic maps, built on Portland&apos;s open data.</h2>
              <CurtainLink href="/design-experiments" className={styles.sectionLink} curtainTransition={true}>
                All designs {caret}
              </CurtainLink>
            </div>
            {lead && (
              <CurtainLink
                href={`/design-experiments/${lead.slug}`}
                className={styles.leadCard}
                curtainTransition={true}
              >
                <div className={styles.leadThumbFrame}>
                  <Image
                    src={lead.screenshot!}
                    alt={lead.title}
                    width={960}
                    height={540}
                    priority
                    sizes="(max-width: 830px) 100vw, 620px"
                    className={styles.leadThumb}
                  />
                </div>
                <div className={styles.leadText}>
                  <span className={styles.leadEyebrow}>
                    <span className={styles.leadPulse} aria-hidden="true" />
                    Latest
                  </span>
                  <span className={styles.leadTitle}>{lead.title}</span>
                  <span className={styles.leadBlurb}>{lead.blurb}</span>
                  <span className={styles.leadScope}>{lead.scope}</span>
                  <span className={styles.leadCta}>
                    Open the map {caret}
                  </span>
                </div>
              </CurtainLink>
            )}

            <div className={styles.featuredGrid}>
              {trailing.map((exp, i) => (
                <CurtainLink
                  key={exp.slug}
                  href={`/design-experiments/${exp.slug}`}
                  className={styles.featuredCard}
                  style={{ ["--stagger" as string]: `${i * 90}ms` }}
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
