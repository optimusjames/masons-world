import type { Metadata } from 'next'
import styles from './layout.module.css'

export const metadata: Metadata = {
  title: 'Design Experiments',
  description: 'Interactive design experiments by Josh Coolman — layouts, typography, animation, and visual systems built with code.',
}

export default function DesignExperimentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.layout}>
      {children}
    </div>
  )
}
