'use client'

import { usePathname, useRouter } from 'next/navigation'
import styles from './BackButton.module.css'

export default function BackButton() {
  const pathname = usePathname()
  const router = useRouter()

  // Only show on experiment pages (not on homepage or design-experiments gallery)
  const shouldShow = pathname !== '/' && pathname !== '/design-experiments' && !pathname.startsWith('/docs')

  if (!shouldShow) return null

  return (
    <button onClick={() => router.back()} className={styles.backButton}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
