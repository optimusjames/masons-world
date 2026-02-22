import type { Metadata } from 'next'
import { ChevronLeft, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { getAllRecommendations } from './loadRecommended'
import styles from '../blog.module.css'

export const metadata: Metadata = {
  title: 'Recommended',
  description: 'Links worth sharing — videos, articles, and other finds',
}

export default function RecommendedPage() {
  const items = getAllRecommendations()

  return (
    <div className={styles.blogLayout} data-theme="dark">
      <div className={styles.indexWrapper}>
        <div className={styles.backRow}>
          <Link href="/blog" className={styles.indexBackLink}>
            <ChevronLeft size={14} />
            Blog
          </Link>
        </div>
        <h1 className={styles.indexTitle}>Recommended</h1>
        <p className={styles.indexSubtitle}>
          Links worth sharing
        </p>
        <div className={styles.indexRule} />
        <ul className={styles.recList}>
          {items.map((item) => (
            <li key={item.id} className={styles.recItem}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.recLink}
              >
                {item.title}
                <ArrowUpRight size={14} className={styles.recArrow} />
              </a>
              <span className={styles.recDate}>{item.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
