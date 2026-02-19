import Link from "next/link";
import Image from "next/image";
import NetworkCanvas from "./components/NetworkCanvas";
import HeroVideo from "./components/HeroVideo";
import { getAllPosts } from "@/lib/blog/loadBlog";
import { getNavCategories } from "@/lib/docs/loadDocs";
import styles from "./page.module.css";

const recentExperiments = [
  {
    slug: "sticky-notes",
    title: "Sticky Notes",
    date: "Feb 18, 2026",
    screenshot: "/screenshots/sticky-notes.png",
  },
  {
    slug: "contact-sheet",
    title: "Contact Sheet",
    date: "Feb 17, 2026",
    screenshot: "/screenshots/contact-sheet.png",
  },
  {
    slug: "font-pairings",
    title: "Font Pairings",
    date: "Feb 15, 2026",
    screenshot: "/screenshots/font-pairings.png",
  },
];

export default function Home() {
  const posts = getAllPosts().slice(0, 3);
  const docs = getNavCategories()
    .flatMap((cat) => cat.items)
    .filter((doc) => !doc.slug.match(/^overview$/))
    .slice(0, 3);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.networkBackground}>
        <NetworkCanvas className={styles.networkCanvas} />
      </div>

      <div className={styles.contentOverlay}>
        <div className={styles.contentWrapper}>
          <HeroVideo />
          <div className={styles.greetingText}>Greetings Starfighter!</div>
          <p className={styles.tagline}>
            A place where I play around and code in public.{" "}
            <a
              href="https://github.com/joshcoolman-smc/sandbox"
              className={styles.taglineLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              View the repo
            </a>
          </p>

          <div className={styles.columns}>
            {/* Design */}
            <Link href="/design-experiments" className={styles.column}>
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
            </Link>

            {/* Blog */}
            <Link href="/blog" className={styles.column}>
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
            </Link>

            {/* Docs */}
            <Link href="/docs" className={styles.column}>
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
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
