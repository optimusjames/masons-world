import { notFound } from 'next/navigation'
import { getDocBySlug, getHeadingsForSlug, getNavCategories } from '@/lib/docs/loadDocs'
import DocsContent from '../../_components/DocsContent'
import TableOfContents from '../../_components/TableOfContents'
import styles from '../../docs.module.css'

interface DocPageProps {
  params: Promise<{ slug: string[] }>
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params
  const doc = getDocBySlug(slug)

  if (!doc) {
    notFound()
  }

  const headings = getHeadingsForSlug(slug)

  return (
    <div className={styles.contentWrapper}>
      <article className={styles.article}>
        <DocsContent content={doc.content} />
      </article>
      <TableOfContents headings={headings} />
    </div>
  )
}

export async function generateStaticParams() {
  const categories = getNavCategories()
  const params: { slug: string[] }[] = []

  for (const category of categories) {
    for (const item of category.items) {
      params.push({ slug: item.slug.split('/') })
    }
  }

  return params
}
