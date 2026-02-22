import type { Metadata } from 'next'
import { experiments } from './data'

export function experimentMetadata(slug: string): Metadata {
  const exp = experiments.find(e => e.slug === slug)
  if (!exp) return {}
  return {
    title: exp.title,
    description: exp.description,
    openGraph: {
      title: exp.title,
      description: exp.description,
      images: exp.screenshot ? [exp.screenshot] : undefined,
    },
  }
}
