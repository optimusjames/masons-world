import Link from 'next/link'
/* eslint-disable @next/next/no-img-element */
import type { BlogMeta } from '@/lib/blog/types'
import styles from '../blog.module.css'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogCard({ post }: { post: BlogMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className={styles.card}>
      <div className={styles.cardImageWrapper}>
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className={styles.cardImage}
          />
        ) : null}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <time>{formatDate(post.date)}</time>
          {post.readingTime && (
            <span className={styles.readingTime}>{post.readingTime} read</span>
          )}
        </div>
        <h2 className={styles.cardTitle}>{post.title}</h2>
        {post.subtitle && (
          <p className={styles.cardSubtitle}>{post.subtitle}</p>
        )}
      </div>
    </Link>
  )
}
