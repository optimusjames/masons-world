import { getAllPosts } from '@/lib/blog/loadBlog'
import BlogCard from '../_components/BlogCard'
import styles from '../blog.module.css'

export const metadata = {
  title: 'Blog',
  description: 'Thoughts on agentic design, AI workflows, and building in public',
}

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <div className={styles.indexWrapper}>
      <h1 className={styles.indexTitle}>Blog</h1>
      <div className={styles.cardGrid}>
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}
