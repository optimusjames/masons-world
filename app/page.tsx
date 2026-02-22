import Image from "next/image";
import { Bitter, Lora, Space_Mono } from "next/font/google";
import NetworkCanvas from "./components/NetworkCanvas";
import HeroVideo from "./components/HeroVideo";
import CurtainLink from "./components/CurtainLink";
import SkullEasterEgg from "./components/SkullEasterEgg";
import { getAllPosts } from "@/lib/blog/loadBlog";
import { getNavCategories } from "@/lib/docs/loadDocs";
import styles from "./page.module.css";

const bitter = Bitter({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-bitter",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-lora",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

const recentExperiments = [
  {
    slug: "retro-tech",
    title: "Retro Tech Control Panel",
    date: "Feb 20, 2026",
    screenshot: "/screenshots/retro-tech.png",
  },
  {
    slug: "crossfit-bento",
    title: "CrossFit Bento",
    date: "Feb 20, 2026",
    screenshot: "/screenshots/crossfit-bento.png",
  },
  {
    slug: "sticky-notes",
    title: "Sticky Notes",
    date: "Feb 18, 2026",
    screenshot: "/screenshots/sticky-notes.png",
  },
];

export default function Home() {
  const posts = getAllPosts().slice(0, 3);
  const docs = getNavCategories()
    .flatMap((cat) => cat.items)
    .filter((doc) => !doc.slug.match(/^overview$/))
    .slice(0, 3);

  return (
    <main className={`${styles.mainContainer} ${bitter.variable} ${lora.variable} ${spaceMono.variable}`}>
      <div className={styles.networkBackground}>
        <NetworkCanvas className={styles.networkCanvas} />
      </div>

      <div className={styles.contentOverlay}>
        <div className={styles.contentWrapper}>
          <HeroVideo />
          <div className={styles.greetingText}>Greetings Starfighter!</div>

          <div className={styles.columns}>
            {/* Design */}
            <CurtainLink href="/design-experiments" className={styles.column} curtainTransition={true}>
              <div className={styles.columnTitle}>
                Design
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.columnItems}>
                {recentExperiments.map((exp) => (
                  <div key={exp.slug} className={styles.columnItem}>
                    <Image
                      src={exp.screenshot}
                      alt={exp.title}
                      width={60}
                      height={45}
                      className={styles.itemThumb}
                    />
                    <div className={styles.itemText}>
                      <span className={styles.itemTitle}>{exp.title}</span>
                      <span className={styles.itemDate}>{exp.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CurtainLink>

            {/* Blog */}
            <CurtainLink href="/blog" className={styles.column} curtainTransition={true}>
              <div className={styles.columnTitle}>
                Blog
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.columnItems}>
                {posts.map((post) => (
                  <div key={post.slug} className={styles.columnItem}>
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={60}
                        height={45}
                        className={styles.itemThumb}
                      />
                    )}
                    <div className={styles.itemText}>
                      <span className={styles.itemTitle}>{post.title}</span>
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
                  </div>
                ))}
              </div>
            </CurtainLink>

            {/* Docs */}
            <CurtainLink href="/docs" className={styles.column} curtainTransition={true}>
              <div className={styles.columnTitle}>
                Docs
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.columnItems}>
                {docs.map((doc) => (
                  <div key={doc.slug} className={styles.columnItem}>
                    <div className={styles.itemText}>
                      <span className={styles.itemTitle}>{doc.title}</span>
                      {doc.description && (
                        <span className={styles.itemDate}>{doc.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CurtainLink>
          </div>

          <div className={styles.footer}>
            <span className={styles.footerLeft}>MIT 2026</span>
            <div className={styles.footerIcons}>
              <a
                href="https://github.com/joshcoolman-smc/sandbox"
                className={styles.footerLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <SkullEasterEgg className={styles.skullIcon} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
