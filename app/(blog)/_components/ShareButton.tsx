'use client'

import { useState, useRef } from 'react'
import { Share2, Check } from 'lucide-react'
import styles from '../blog.module.css'

interface ShareButtonProps {
  title: string
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  async function handleShare() {
    const url = window.location.href

    // Always copy to clipboard first
    await navigator.clipboard.writeText(url)
    if (timerRef.current) clearTimeout(timerRef.current)
    setCopied(true)
    timerRef.current = setTimeout(() => setCopied(false), 2000)

    // Then try native share sheet on top
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled — link is already copied
      }
    }
  }

  return (
    <button
      className={`${styles.shareButton} ${copied ? styles.shareButtonCopied : ''}`}
      onClick={handleShare}
      aria-label="Share this post"
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      <span className={`${styles.copiedToast} ${copied ? styles.copiedToastVisible : ''}`}>
        Copied!
      </span>
    </button>
  )
}
