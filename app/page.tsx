import Image from "next/image";
import CurtainLink from "./components/CurtainLink";
import SiteFooter from "./components/SiteFooter";
import { getAllPosts } from "@/lib/blog/loadBlog";
import { getRecentDocs } from "@/lib/docs/loadDocs";
import { experiments } from "@/lib/experiments/data";

import styles from "./page.module.css";

const GREETINGS = [
  { text: "Greetings, Earthling.", color: "#7FE8A0", glow: "#7FE8A0" },
  { text: "Oh, hello there.", color: "#1E3FBA", glow: "#4A8AFF" },
  { text: "You found me.", color: "#5EC47A", glow: "#7FE8A0" },
  { text: "Don\u2019t panic.", color: "#7FE8A0", glow: "#7FE8A0" },
  { text: "Signal received.", color: "#8FF7F9", glow: "#8FF7F9" },
  { text: "Transmission incoming.", color: "#5EC47A", glow: "#7FE8A0" },
];

export default function Home() {
  const recentExperiments = experiments.slice(0, 3);
  const posts = getAllPosts().slice(0, 3);
  const recentDocs = getRecentDocs(3);

  const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

  return (
    <main
      className={styles.mainContainer}
      style={{ "--glow-color": greeting.glow } as React.CSSProperties}
    >
      <div className={styles.ambientGlow} />
      <div className={styles.contentOverlay}>
        <div className={styles.contentWrapper}>
          <div
            className={styles.greetingText}
            style={{
              color: greeting.color,
              textShadow: `0 0 7px ${greeting.glow}90, 0 0 20px ${greeting.glow}60, 0 0 40px ${greeting.glow}30, 0 0 60px ${greeting.glow}18`,
            }}
          >
            {greeting.text}
          </div>

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
