import { redirect } from 'next/navigation'
import { getFirstDocSlug } from '@/lib/docs/loadDocs'

export default function DocsIndexPage() {
  const firstSlug = getFirstDocSlug()
  if (firstSlug) {
    redirect(`/docs/${firstSlug}`)
  }
  return <div>No documentation found.</div>
}
