'use client'

import { useEffect, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import CurtainLink from '@/app/components/CurtainLink'
import StickyNoteStack from '@/app/design-experiments/sticky-notes/components/StickyNoteStack'
import type { StickyNote } from '@/app/design-experiments/sticky-notes/types'
import type { BlogMeta } from '@/lib/blog/types'
import BlogCard from './BlogCard'
import styles from '../blog.module.css'

interface Props {
  posts: BlogMeta[]
  notes: StickyNote[]
}

export default function BlogIndexContent({ posts, notes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('blog-visited')
    const cards = containerRef.current?.querySelectorAll(`.${styles.card}`)

    if (hasVisited) {
      // Skip animation on return visits — show everything immediately
      cards?.forEach((el) => el.classList.add(styles.cardVisible))
    } else {
      sessionStorage.setItem('blog-visited', '1')

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(styles.cardVisible)
            }
          })
        },
        { threshold: 0.1 }
      )

      cards?.forEach((card) => observer.observe(card))

      return () => observer.disconnect()
    }

    // Scroll restoration: check hash or sessionStorage
    const hash = window.location.hash?.slice(1)
    const saved = sessionStorage.getItem('blog-last-slug')
    const target = hash || saved
    if (target) {
      sessionStorage.removeItem('blog-last-slug')
      const el = document.getElementById(target)
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'instant' })
      }
      if (hash) {
        history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={styles.indexWrapper}>
      <div className={styles.backRow}>
        <CurtainLink href="/" className={styles.indexBackLink} curtainTransition={true} curtainReverse={true}>
          <ChevronLeft size={14} />
          Back
        </CurtainLink>
      </div>
      <div className={styles.headerRow}>
        <h1 className={styles.indexTitle}>Blog</h1>
        <div className={styles.stickyNotesWrapper}>
          <StickyNoteStack notes={notes} />
        </div>
      </div>
      <p className={styles.indexSubtitle}>When the mood strikes</p>
      <Link href="/recommended" className={styles.indexMetaLink}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={styles.indexMetaHeart}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        Link Worthy
        <svg width="8" height="8" viewBox="0 0 20 20" fill="none" className={styles.indexMetaCaret}>
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <div className={styles.cardGrid}>
        {posts.map((post, index) => (
          <div
            key={post.slug}
            id={post.slug}
            onClick={() => sessionStorage.setItem('blog-last-slug', post.slug)}
          >
            <BlogCard post={post} delay={Math.min(index + 1, 6)} />
          </div>
        ))}
      </div>
    </div>
  )
}
