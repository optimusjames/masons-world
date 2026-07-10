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
      <button
        type="button"
        className={`${styles.toggle}${open ? ' ' + styles.toggleOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
          <g className={styles.stars}>
            <line x1="5" y1="7" x2="12" y2="4.5" />
            <line x1="12" y1="4.5" x2="18.5" y2="9" />
            <line x1="5" y1="7" x2="9" y2="14" />
            <line x1="9" y1="14" x2="16" y2="17.5" />
            <line x1="18.5" y1="9" x2="16" y2="17.5" />
            <circle cx="5" cy="7" r="1.6" />
            <circle cx="12" cy="4.5" r="1.6" />
            <circle cx="18.5" cy="9" r="1.6" />
            <circle cx="9" cy="14" r="1.6" />
            <circle cx="16" cy="17.5" r="1.6" />
          </g>
          <g className={styles.cross}>
            <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" />
            <line x1="17.5" y1="6.5" x2="6.5" y2="17.5" />
          </g>
        </svg>
      </button>

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
