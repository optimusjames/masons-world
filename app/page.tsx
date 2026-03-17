import Image from "next/image";
import CurtainLink from "./components/CurtainLink";
import SiteFooter from "./components/SiteFooter";
import { getAllPosts } from "@/lib/blog/loadBlog";
import { getRecentDocs } from "@/lib/docs/loadDocs";
import { experiments } from "@/lib/experiments/data";

import RandomGreeting from "./components/RandomGreeting";
import styles from "./page.module.css";

export default function Home() {
  const recentExperiments = experiments.slice(0, 3);
  const posts = getAllPosts().slice(0, 3);
  const recentDocs = getRecentDocs(3);

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
                  <CurtainLink key={exp.slug} href={`/design-experiments/${exp.slug}`} className={styles.columnItem} curtainTransition={true}>
                    <Image
                      src={exp.screenshot}
                      alt={exp.title}
                      width={60}
                      height={45}
                      sizes="60px"
                      className={styles.itemThumb}
                    />
                    <div className={styles.itemText}>
                      <span className={styles.itemTitle}>{exp.title}</span>
                      <span className={styles.itemDate}>{exp.date}</span>
                    </div>
                  </CurtainLink>
                ))}
              </div>
            </div>

            {/* Blog */}
            <div className={styles.column}>
              <CurtainLink href="/blog" className={styles.columnTitle} curtainTransition={true}>
                Blog
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </CurtainLink>
              <div className={styles.columnItems}>
                {posts.map((post) => (
                  <CurtainLink key={post.slug} href={`/blog/${post.slug}`} className={styles.columnItem} curtainTransition={true}>
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={60}
                        height={45}
                        sizes="60px"
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
                ))}
              </div>
            </div>

            {/* Docs */}
            <div className={styles.column}>
              <CurtainLink href="/docs" className={styles.columnTitle} curtainTransition={true}>
                Docs
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </CurtainLink>
              <div className={styles.columnItems}>
                {recentDocs.map((doc) => (
                  <CurtainLink key={doc.slug} href={doc.href} className={styles.columnItem} curtainTransition={true}>
                    <div className={styles.itemText}>
                      <span className={styles.itemTitle}>{doc.title}</span>
                      {doc.description ? (
                        <span className={styles.itemDate}>{doc.description}</span>
                      ) : (
                        <span className={styles.itemDate}>
                          {doc.modified.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </CurtainLink>
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
