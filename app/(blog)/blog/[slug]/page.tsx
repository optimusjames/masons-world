import { notFound } from 'next/navigation'
/* eslint-disable @next/next/no-img-element */
import { getAllPosts, getPostBySlug } from '@/lib/blog/loadBlog'
import BlogContent from '../../_components/BlogContent'
import styles from '../../blog.module.css'

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.meta.title,
    description: post.meta.subtitle,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  if (post.meta.overlay && post.meta.image) {
    return (
      <div className={styles.postWrapper}>
        <div className={styles.overlayHero}>
          <img
            src={post.meta.image}
            alt={post.meta.title}
            className={styles.overlayImage}
          />
          <div className={styles.overlayGradient} />
          <header className={styles.overlayHeader}>
            <div className={styles.postMeta}>
              <time>{formatDate(post.meta.date)}</time>
              {post.meta.readingTime && (
                <span className={styles.readingTime}>{post.meta.readingTime} read</span>
              )}
            </div>
            <h1 className={styles.postTitle}>{post.meta.title}</h1>
            {post.meta.subtitle && (
              <p className={styles.postSubtitle}>{post.meta.subtitle}</p>
            )}
          </header>
        </div>

        <BlogContent content={post.content} />

        <footer className={styles.postFooter}>
          <div className={styles.footerNote}>Blog / 2026</div>
        </footer>
      </div>
    )
  }

  return (
    <div className={styles.postWrapper}>
      <header className={styles.postHeader}>
        <div className={styles.postMeta}>
          <time>{formatDate(post.meta.date)}</time>
          {post.meta.readingTime && (
            <span className={styles.readingTime}>{post.meta.readingTime} read</span>
          )}
        </div>
        <h1 className={styles.postTitle}>{post.meta.title}</h1>
        {post.meta.subtitle && (
          <p className={styles.postSubtitle}>{post.meta.subtitle}</p>
        )}
      </header>

      {post.meta.image && (
        <div className={styles.postImageWrapper}>
          <img
            src={post.meta.image}
            alt={post.meta.title}
            className={styles.postImage}
          />
        </div>
      )}

      <BlogContent content={post.content} />

      <footer className={styles.postFooter}>
        <div className={styles.footerNote}>Blog / 2026</div>
      </footer>
    </div>
  )
}
