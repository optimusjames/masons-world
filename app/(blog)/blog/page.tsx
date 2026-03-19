import path from 'path'
import { getAllPosts } from '@/lib/blog/loadBlog'
import { getAllNotes } from '@/app/design-experiments/(experiments)/sticky-notes'
import BlogIndexContent from '../_components/BlogIndexContent'

export const metadata = {
  title: 'Writing',
  description: 'Essays, reflections, and creative writing — when the mood strikes',
}

export default function BlogIndex() {
  const posts = getAllPosts()
  const notes = getAllNotes(path.join(process.cwd(), 'app/(blog)/notes'))

  return <BlogIndexContent posts={posts} notes={notes} />
}
