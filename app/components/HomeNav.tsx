'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import CurtainLink from './CurtainLink'
import styles from './HomeNav.module.css'

const LINKS = [
  { href: '/design-experiments', label: 'Design' },
  { href: '/blog', label: 'Writing' },
  { href: '/recommended', label: 'Finds' },
  { href: '/docs', label: 'Docs' },
]

const CONTACT = 'https://www.linkedin.com/in/optimizationmason/'

export default function HomeNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change or Escape
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={styles.nav}>
      {/* Desktop — inline links */}
      <div className={styles.inline}>
        {LINKS.map((l) => (
          <CurtainLink key={l.href} href={l.href} className={styles.link} curtainTransition={true}>
            {l.label}
          </CurtainLink>
        ))}
        <a href={CONTACT} target="_blank" rel="noopener noreferrer" className={styles.contact}>
          Contact
        </a>
      </div>

      {/* Mobile — hamburger */}
      <button
        type="button"
        className={`${styles.burger}${open ? ' ' + styles.burgerOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile — dropdown panel */}
      <div className={`${styles.panel}${open ? ' ' + styles.panelOpen : ''}`} role="menu" aria-hidden={!open}>
        {LINKS.map((l) => (
          <CurtainLink key={l.href} href={l.href} className={styles.panelLink} curtainTransition={true} role="menuitem">
            {l.label}
          </CurtainLink>
        ))}
        <a href={CONTACT} target="_blank" rel="noopener noreferrer" className={styles.panelContact} role="menuitem">
          Contact
        </a>
      </div>
    </div>
  )
}
