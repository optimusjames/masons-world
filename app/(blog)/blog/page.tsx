import path from 'path'
import { getAllPosts } from '@/lib/blog/loadBlog'
import { getAllNotes } from '@/app/design-experiments/sticky-notes'
import BlogIndexContent from '../_components/BlogIndexContent'

export const metadata = {
  title: 'Blog',
  description: 'Markdown posts with editorial styling, written when the mood strikes',
}

export default function BlogIndex() {
  const posts = getAllPosts()
  const notes = getAllNotes(path.join(process.cwd(), 'app/(blog)/notes'))

  return <BlogIndexContent posts={posts} notes={notes} />
}
