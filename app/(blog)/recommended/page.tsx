import type { Metadata } from 'next'
import { ChevronLeft, ArrowUpRight, YoutubeIcon, GithubIcon, Globe, FileText } from 'lucide-react'
import Link from 'next/link'
import { getAllRecommendations } from './loadRecommended'
import type { Recommendation } from './types'
import styles from '../blog.module.css'

export const metadata: Metadata = {
  title: 'Recommended',
  description: 'Links worth sharing — videos, articles, and other finds',
}

const sourceConfig = {
  youtube: { icon: YoutubeIcon, label: 'YouTube' },
  github: { icon: GithubIcon, label: 'GitHub' },
  pdf: { icon: FileText, label: 'PDF' },
  web: { icon: Globe, label: null },
} as const

function SourceBadge({ source }: { source: Recommendation['source'] }) {
  const { icon: Icon, label } = sourceConfig[source]
  return (
    <span className={`${styles.recBadge} ${label ? styles.recBadgeLabeled : ''}`}>
      <Icon size={14} />
      {label && <span className={styles.recBadgeLabel}>{label}</span>}
    </span>
  )
}

export default async function RecommendedPage() {
  const items = await getAllRecommendations()

  return (
    <div className={styles.blogLayout} data-theme="dark">
      <div className={styles.indexWrapper}>
        <div className={styles.backRow}>
          <Link href="/blog" className={styles.indexBackLink}>
            <ChevronLeft size={14} />
            Blog
          </Link>
        </div>
        <h1 className={styles.indexTitle}>Link Worthy</h1>
        <p className={styles.indexSubtitle}>
          If you&apos;re bored...
        </p>
        <ul className={styles.recList}>
          {items.map((item) => (
            <li key={item.id} className={styles.recItem}>
              {item.thumbnail ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.recThumbLink}>
                  <img src={item.thumbnail} alt="" className={styles.recThumb} />
                </a>
              ) : (
                <div className={styles.recThumbPlaceholder} />
              )}
              <div className={styles.recBody}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.recLink}
                >
                  {item.title}
                  <ArrowUpRight size={14} className={styles.recArrow} />
                </a>
                {item.author && (
                  <span className={styles.recMeta}>
                    {item.authorUrl
                      ? <a href={item.authorUrl} target="_blank" rel="noopener noreferrer" className={styles.recAuthorLink}>{item.author}</a>
                      : <span>{item.author}</span>
                    }
                  </span>
                )}
                {item.note && (
                  <p className={styles.recNote}>{item.note}</p>
                )}
              </div>
              <SourceBadge source={item.source} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
