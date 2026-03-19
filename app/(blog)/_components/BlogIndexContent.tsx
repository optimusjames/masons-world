'use client'

import { useEffect, useRef } from 'react'
import { ChevronLeft, Telescope } from 'lucide-react'
import Link from 'next/link'
import CurtainLink from '@/app/components/CurtainLink'
import StickyNoteStack from '@/app/design-experiments/(experiments)/sticky-notes/components/StickyNoteStack'
import type { StickyNote } from '@/app/design-experiments/(experiments)/sticky-notes/types'
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
        <h1 className={styles.indexTitle}>Writing</h1>
        <div className={styles.stickyNotesWrapper}>
          <StickyNoteStack notes={notes} />
        </div>
      </div>
      <p className={styles.indexSubtitle}>When the mood strikes</p>
      <CurtainLink href="/recommended" className={`${styles.indexMetaLink} ${styles.indexMetaLinkRight}`} curtainTransition={true} curtainDirection="right">
        <Telescope size={12} className={styles.indexMetaIcon} />
        Explore
      </CurtainLink>
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
