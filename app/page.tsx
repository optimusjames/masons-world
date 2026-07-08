import Image from "next/image";
import CurtainLink from "./components/CurtainLink";
import SiteFooter from "./components/SiteFooter";
import { getAllPosts } from "@/lib/blog/loadBlog";
import { getAllRecommendations } from "@/app/(blog)/recommended/loadRecommended";
import { experiments } from "@/lib/experiments/data";

import Greeting from "./components/Greeting";
import ShakeCard from "./components/ShakeCard";
import styles from "./page.module.css";

// The three map projects, in the order they should headline the page, each with
// a short blurb tuned for the featured cards (the data descriptions run long).
const FEATURED = [
  { slug: "cool-pdx", blurb: "A heat-relief map for Portland — find the nearest shade, water, and cool air on a hot day." },
  { slug: "fixit-pdx", blurb: "A cleaner take on the city's issue reporter. One map, two taps: see what's fixed, or report a problem." },
  { slug: "mcloughlin-99e", blurb: "A scrollytelling case study of the 3-year effort to slow down a deadly stretch of OR-99E." },
];

const caret = (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default async function Home() {
  const bySlug = new Map(experiments.map((e) => [e.slug, e]));
  const featured = FEATURED.map((f) => ({ ...bySlug.get(f.slug)!, blurb: f.blurb }));
  const posts = getAllPosts().slice(0, 3);
  const recentExplores = (await getAllRecommendations()).slice(0, 3);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.ambientGlow} />
      <div className={styles.contentOverlay}>
        <div className={styles.contentWrapper}>
          {/* Identity anchor */}
          <div className={styles.identity}>
            <Greeting className={styles.greetingText} />
            <div className={styles.intro}>
              <h1 className={styles.name}>I&apos;m James Mason</h1>
              <p className={styles.tagline}>I build interactive maps, tools, and design experiments.</p>
            </div>
          </div>

          {/* Featured Work — the three map projects */}
          <section className={styles.featured}>
            <div className={styles.featuredHeader}>
              <span className={styles.featuredTitle}>Featured Work</span>
              <CurtainLink href="/design-experiments" className={styles.featuredAll} curtainTransition={true}>
                All experiments
                {caret}
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
                      height={300}
                      sizes="(max-width: 830px) 100vw, 300px"
                      className={styles.featuredThumb}
                    />
                  )}
                  <div className={styles.featuredText}>
                    <span className={styles.featuredCardTitle}>{exp.title}</span>
                    <span className={styles.featuredBlurb}>{exp.blurb}</span>
                    <span className={styles.featuredTags}>{exp.tags.slice(0, 3).join(" · ")}</span>
                  </div>
                </CurtainLink>
              ))}
            </div>
          </section>

          {/* Secondary — Writing + Recommendations */}
          <div className={styles.columns}>
            {/* Writing */}
            <div className={styles.column}>
              <CurtainLink href="/blog" className={styles.columnTitle} curtainTransition={true}>
                Writing
                {caret}
              </CurtainLink>
              <span className={styles.columnSubtitle}>Philosophy · Mindset · Tech</span>
              <div className={styles.columnItems}>
                {posts.map((post) => (
                  <ShakeCard key={post.slug} className={styles.columnItem}>
                    <CurtainLink href={`/blog/${post.slug}`} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }} curtainTransition={true}>
                      {post.image && (
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={200}
                          height={150}
                          sizes="100px"
                          className={styles.itemThumb}
                        />
                      )}
                      <div className={styles.itemText}>
                        <span className={styles.itemTitle}>{post.title}</span>
                        {post.subtitle && (
                          <span className={styles.itemSnippet}>{post.subtitle}</span>
                        )}
                        {post.date && (
                          <span className={styles.itemDate}>
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </CurtainLink>
                  </ShakeCard>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className={styles.column}>
              <CurtainLink href="/recommended" className={styles.columnTitle} curtainTransition={true}>
                Recommendations
                {caret}
              </CurtainLink>
              <span className={styles.columnSubtitle}>Reads · Finds · Rabbit Holes</span>
              <div className={styles.columnItems}>
                {recentExplores.map((item) => (
                  <ShakeCard key={item.id} className={`${styles.columnItem} ${styles.columnItemReversed}`}>
                    <CurtainLink href="/recommended" style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }} curtainTransition={true}>
                      {item.thumbnail && (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={200}
                          height={150}
                          sizes="100px"
                          className={styles.itemThumb}
                        />
                      )}
                      <div className={styles.itemText}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.itemDate}>{new Date(`${item.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </CurtainLink>
                  </ShakeCard>
                ))}
              </div>
            </div>
          </div>
          <SiteFooter className={styles.homeFooter} />
        </div>
      </div>
    </main>
  );
}
