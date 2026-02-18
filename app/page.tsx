import Link from "next/link";
import Image from "next/image";
import NetworkCanvas from "./components/NetworkCanvas";
import HeroVideo from "./components/HeroVideo";
import { getAllPosts } from "@/lib/blog/loadBlog";
import { getNavCategories } from "@/lib/docs/loadDocs";
import styles from "./page.module.css";

const recentExperiments = [
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
  {
    slug: "modular-grid",
    title: "Modular Grid",
    date: "Feb 14, 2026",
    screenshot: "/screenshots/modular-grid.png",
  },
];

export default function Home() {
  const posts = getAllPosts().slice(0, 3);
  const docs = getNavCategories()
    .flatMap((cat) => cat.items)
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

          <div className={styles.columns}>
            {/* Design Experiments */}
            <div className={styles.column}>
              <Link href="/design-experiments" className={styles.columnTitle}>
                Design
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <div className={styles.columnItems}>
                {recentExperiments.map((exp) => (
                  <Link
                    key={exp.slug}
                    href={`/design-experiments/${exp.slug}`}
                    className={styles.columnItem}
                  >
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
                  </Link>
                ))}
              </div>
            </div>

            {/* Blog */}
            <div className={styles.column}>
              <Link href="/blog" className={styles.columnTitle}>
                Blog
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <div className={styles.columnItems}>
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className={styles.columnItem}
                  >
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
                  </Link>
                ))}
              </div>
            </div>

            {/* Docs */}
            <div className={styles.column}>
              <Link href="/docs" className={styles.columnTitle}>
                Docs
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <div className={styles.columnItems}>
                {docs.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={doc.href}
                    className={styles.columnItem}
                  >
                    <div className={styles.itemText}>
                      <span className={styles.itemTitle}>{doc.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
