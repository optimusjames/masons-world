'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronLeft, Menu, X } from 'lucide-react'
import type { DocNavCategory } from '@/lib/docs/types'
import styles from '../docs.module.css'

interface DocsSidebarProps {
  categories: DocNavCategory[]
}

export default function DocsSidebar({ categories }: DocsSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCategory = (name: string) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const sidebarContent = (
    <>
      <div className={styles.sidebarBack}>
        <Link href="/" className={styles.backLink}>
          <ChevronLeft size={14} />
          Back
        </Link>
      </div>
      <div className={styles.sidebarHeader}>
        <Link href="/docs" className={styles.sidebarTitle}>
          Docs
        </Link>
      </div>
      {categories.map((category) => {
        const isCollapsed = collapsed[category.name]
        const showLabel = categories.length > 1

        return (
          <div key={category.name} className={styles.category}>
            {showLabel && (
              <button
                className={styles.categoryButton}
                onClick={() => toggleCategory(category.name)}
              >
                <ChevronDown
                  size={12}
                  className={`${styles.categoryIcon} ${isCollapsed ? styles.categoryIconCollapsed : ''}`}
                />
                {category.name}
              </button>
            )}
            {!isCollapsed && (
              <div className={styles.categoryItems}>
                {category.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.title}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </>
  )

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div
        className={`${styles.sidebarOverlay} ${mobileOpen ? styles.sidebarOverlayVisible : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <nav className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        {sidebarContent}
      </nav>
    </>
  )
}
