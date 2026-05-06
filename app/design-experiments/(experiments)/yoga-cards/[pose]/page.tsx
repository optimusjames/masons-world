import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { poses } from '../data'
import YogaCard from '../components/YogaCard'
import '../styles.css'

export function generateStaticParams() {
  return poses.map(p => ({ pose: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pose: string }>
}): Promise<Metadata> {
  const { pose: poseId } = await params
  const pose = poses.find(p => p.id === poseId)
  if (!pose) return {}

  const title = `${pose.name} — Yoga Cards`
  const description = pose.benefits.join('. ')
  const imageUrl = pose.image.startsWith('http')
    ? pose.image
    : `https://masons-world.vercel.app${pose.image}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 800, height: 800 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function PosePage({
  params,
}: {
  params: Promise<{ pose: string }>
}) {
  const { pose: poseId } = await params
  const pose = poses.find(p => p.id === poseId)
  if (!pose) notFound()

  return (
    <div className="pose-page">
      <nav className="pose-page__nav">
        <Link href="/design-experiments/yoga-cards">← All Poses</Link>
      </nav>
      <YogaCard pose={pose} />
      <div className="pose-page__meta">
        <h1>{pose.name}</h1>
        <p>{pose.sanskrit}</p>
      </div>
    </div>
  )
}
