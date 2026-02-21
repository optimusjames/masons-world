import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design Experiments',
  description: 'Interactive design experiments by Josh Coolman — layouts, typography, animation, and visual systems built with code.',
}

export default function DesignExperimentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
