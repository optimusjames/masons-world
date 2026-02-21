import path from 'path'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import CurtainLink from '@/app/components/CurtainLink'
import { getAllPosts } from '@/lib/blog/loadBlog'
import { getAllNotes, StickyNoteStack } from '@/app/design-experiments/sticky-notes'
import BlogCard from '../_components/BlogCard'
import styles from '../blog.module.css'

export const metadata = {
  title: 'Blog',
  description: 'Markdown posts with editorial styling, written when the mood strikes',
}

export default function BlogIndex() {
  const posts = getAllPosts()
  const notes = getAllNotes(path.join(process.cwd(), 'app/(blog)/notes'))

  return (
    <div className={styles.indexWrapper}>
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
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}
