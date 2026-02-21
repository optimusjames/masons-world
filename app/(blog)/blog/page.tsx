'use client'

import { useEffect, useRef } from 'react'
import path from 'path'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import CurtainLink from '@/app/components/CurtainLink'
import { getAllPosts } from '@/lib/blog/loadBlog'
import { getAllNotes, StickyNoteStack } from '@/app/design-experiments/sticky-notes'
import BlogCard from '../_components/BlogCard'
import styles from '../blog.module.css'

export default function BlogIndex() {
  const containerRef = useRef<HTMLDivElement>(null)
  const posts = getAllPosts()
  const notes = getAllNotes(path.join(process.cwd(), 'app/(blog)/notes'))

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('blog-visited')
    const cards = containerRef.current?.querySelectorAll(`.${styles.card}`)

    if (hasVisited) {
      // Skip animation on return visits — show everything immediately
      cards?.forEach((el) => el.classList.add(styles.cardVisible))
      return
    }

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
        <StickyNoteStack notes={notes} />
      </div>
      <p className={styles.indexSubtitle}>
        Markdown posts with editorial styling, written when the mood strikes
      </p>
      <div className={styles.indexRule}></div>
      <div className={styles.cardGrid}>
        {posts.map((post, index) => (
          <BlogCard key={post.slug} post={post} delay={Math.min(index + 1, 6)} />
        ))}
      </div>
    </div>
  )
}
