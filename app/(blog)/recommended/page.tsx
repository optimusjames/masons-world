import type { Metadata } from 'next'
import { ChevronLeft, ArrowUpRight, YoutubeIcon, GithubIcon, Globe, FileText, Feather } from 'lucide-react'
import Link from 'next/link'
import { getAllRecommendations } from './loadRecommended'
import type { Recommendation } from './types'
import styles from '../blog.module.css'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Links worth sharing — videos, articles, and other finds',
}

const sourceConfig = {
  youtube: { icon: YoutubeIcon, label: 'YouTube' },
  github: { icon: GithubIcon, label: 'GitHub' },
  pdf: { icon: FileText, label: 'PDF' },
  web: { icon: Globe, label: 'Site' },
} as const

function SourceBadge({ source }: { source: Recommendation['source'] }) {
  const { icon: Icon, label } = sourceConfig[source]
  return (
    <span className={`${styles.recBadge} ${styles.recBadgeLabeled}`}>
      <Icon size={14} />
      <span className={styles.recBadgeLabel}>{label}</span>
    </span>
  )
}

export default async function RecommendedPage() {
  const items = await getAllRecommendations()

  return (
    <div className={styles.blogLayout} data-theme="dark">
      <div className={styles.indexWrapper}>
        <div className={styles.backRow}>
          <Link href="/" className={styles.indexBackLink}>
            <ChevronLeft size={14} />
            Back
          </Link>
        </div>
        <h1 className={styles.indexTitle}>Explore</h1>
        <p className={styles.indexSubtitle}>
          If you&apos;re bored...
        </p>
        <Link href="/blog" className={styles.indexMetaLink}>
          <Feather size={12} className={styles.indexMetaIcon} />
          Writing
          <svg width="8" height="8" viewBox="0 0 20 20" fill="none" className={styles.indexMetaCaret}>
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <ul className={styles.recList}>
          {items.map((item) => (
            <li key={item.id} className={styles.recItem}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.recItemLink}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" aria-hidden="true" className={styles.recThumb} />
                ) : (
                  <div className={styles.recThumbPlaceholder} />
                )}
                <div className={styles.recBody}>
                  <span className={styles.recLink}>
                    {item.title}
                    <ArrowUpRight size={14} className={styles.recArrow} />
                  </span>
                  {item.author && (
                    <span className={styles.recMeta}>{item.author}</span>
                  )}
                  {item.note && (
                    <p className={styles.recNote}>{item.note}</p>
                  )}
                </div>
                <SourceBadge source={item.source} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
