import Image from "next/image";
import CurtainLink from "./components/CurtainLink";
import SiteFooter from "./components/SiteFooter";
import { getAllPosts } from "@/lib/blog/loadBlog";
import { getAllRecommendations } from "@/app/(blog)/recommended/loadRecommended";
import { experiments } from "@/lib/experiments/data";

import RandomGreeting from "./components/RandomGreeting";
import ShakeCard from "./components/ShakeCard";
import styles from "./page.module.css";

export default async function Home() {
  const recentExperiments = experiments.slice(0, 3);
  const posts = getAllPosts().slice(0, 3);
  const recentExplores = (await getAllRecommendations()).slice(0, 3);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.ambientGlow} />
      <div className={styles.contentOverlay}>
        <div className={styles.contentWrapper}>
          <RandomGreeting className={styles.greetingText} />

          <div className={styles.columns}>
            {/* Design */}
            <div className={styles.column}>
              <CurtainLink href="/design-experiments" className={styles.columnTitle} curtainTransition={true}>
                Design
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </CurtainLink>
              <div className={styles.columnItems}>
                {recentExperiments.map((exp) => (
                  <ShakeCard key={exp.slug} className={styles.columnItem}>
                    <CurtainLink href={`/design-experiments/${exp.slug}`} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }} curtainTransition={true}>
                      {exp.screenshot && (
                        <Image
                          src={exp.screenshot}
                          alt={exp.title}
                          width={160}
                          height={120}
                          sizes="80px"
                          className={styles.itemThumb}
                        />
                      )}
                      <div className={styles.itemText}>
                        <span className={styles.itemTitle}>{exp.title}</span>
                        <span className={styles.itemDate}>{exp.date}</span>
                      </div>
                    </CurtainLink>
                  </ShakeCard>
                ))}
              </div>
            </div>

            {/* Write */}
            <div className={styles.column}>
              <CurtainLink href="/blog" className={styles.columnTitle} curtainTransition={true}>
                Write
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </CurtainLink>
              <div className={styles.columnItems}>
                {posts.map((post) => (
                  <ShakeCard key={post.slug} className={styles.columnItem}>
                    <CurtainLink href={`/blog/${post.slug}`} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }} curtainTransition={true}>
                      {post.image && (
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={160}
                          height={120}
                          sizes="80px"
                          className={styles.itemThumb}
                        />
                      )}
                      <div className={styles.itemText}>
                        <span className={styles.itemTitle}>{post.title}</span>
                        {post.subtitle ? (
                          <span className={styles.itemDate}>{post.subtitle}</span>
                        ) : post.date ? (
                          <span className={styles.itemDate}>
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : null}
                      </div>
                    </CurtainLink>
                  </ShakeCard>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div className={styles.column}>
              <CurtainLink href="/recommended" className={styles.columnTitle} curtainTransition={true}>
                Explore
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </CurtainLink>
              <div className={styles.columnItems}>
                {recentExplores.map((item) => (
                  <ShakeCard key={item.id} className={styles.columnItem}>
                    <CurtainLink href="/recommended" style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }} curtainTransition={true}>
                      {item.thumbnail && (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={160}
                          height={120}
                          sizes="80px"
                          className={styles.itemThumb}
                        />
                      )}
                      <div className={styles.itemText}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.itemDate}>{new Date(`${item.date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
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
