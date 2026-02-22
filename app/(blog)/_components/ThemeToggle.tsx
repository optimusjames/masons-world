'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import styles from '../blog.module.css'

const STORAGE_KEY = 'blog-theme'

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    const layout = document.querySelector(`.${styles.blogLayout}`)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light') {
      setIsLight(true)
      layout?.setAttribute('data-theme', 'light')
    }
    return () => {
      layout?.removeAttribute('data-theme')
    }
  }, [])

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const layout = (e.currentTarget as HTMLElement).closest(
      `.${styles.blogLayout}`
    ) as HTMLElement | null
    if (!layout) return
    const next = !isLight
    setIsLight(next)
    if (next) {
      layout.setAttribute('data-theme', 'light')
      localStorage.setItem(STORAGE_KEY, 'light')
    } else {
      layout.removeAttribute('data-theme')
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <button
      className={styles.themeToggle}
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  )
}
