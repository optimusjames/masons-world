import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getAllPosts } from '@/lib/blog/loadBlog'
import BlogCard from '../_components/BlogCard'
import styles from '../blog.module.css'

export const metadata = {
  title: 'Blog',
  description: 'Markdown posts with editorial styling, written as the code evolves',
}

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <div className={styles.indexWrapper}>
      <div className={styles.backRow}>
        <Link href="/" className={styles.indexBackLink}>
          <ChevronLeft size={14} />
          Back
        </Link>
      </div>
      <h1 className={styles.indexTitle}>Blog</h1>
      <p className={styles.indexSubtitle}>
        Markdown posts with editorial styling, written as the code evolves
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
