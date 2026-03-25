'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import styles from '../blog.module.css'

interface ShareButtonProps {
  title: string
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // User cancelled or API unavailable — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      className={styles.shareButton}
      onClick={handleShare}
      aria-label="Share this post"
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
    </button>
  )
}
