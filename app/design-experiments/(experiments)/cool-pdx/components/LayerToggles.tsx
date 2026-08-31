'use client'

import { Fragment, useEffect, useState } from 'react'
import styles from '../styles.module.css'
import type { LayerId } from '../types'
import { LayerGlyph } from './icons'

type Props = {
  visibleLayers: LayerId[]
  onToggle: (id: LayerId) => void
}

const ITEMS: { id: LayerId; label: string; color: string }[] = [
  { id: 'canopy', label: 'Tree canopy', color: '#3f9b5c' },
  { id: 'fountains', label: 'Drinking water', color: '#2b8fd0' },
  { id: 'cooling', label: 'Cool air', color: '#6366f1' },
]

export default function LayerToggles({ visibleLayers, onToggle }: Props) {
  // Start collapsed on phones, where the open panel covered the search field and
  // about a third of the map. Desktop ignores this: the header is inert there
  // and the body never hides.
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 540px)').matches) {
      setCollapsed(true)
    }
  }, [])

  return (
    <div className={styles.toggles} data-collapsed={collapsed}>
      <button
        type="button"
        className={styles.togglesHeader}
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span>Map layers</span>
        {/* Collapsed, the dots are the only thing still saying which layers are
            on, so they stand in for the panel rather than decorate it. */}
        <span className={styles.togglesDots} aria-hidden>
          {ITEMS.filter((i) => visibleLayers.includes(i.id)).map((i) => (
            <span key={i.id} className={styles.togglesMiniDot} style={{ background: i.color }} />
          ))}
        </span>
        <span className={styles.togglesChevron} aria-hidden>
          ▾
        </span>
      </button>
      <div className={styles.togglesBody}>
        {ITEMS.map((item) => {
          const on = visibleLayers.includes(item.id)
          return (
            <Fragment key={item.id}>
              <button
                type="button"
                className={styles.toggle}
                data-on={on}
                aria-pressed={on}
                onClick={() => onToggle(item.id)}
              >
                <span
                  className={styles.toggleIcon}
                  style={{
                    background: on ? item.color : 'transparent',
                    color: on ? '#fff' : item.color,
                    boxShadow: on ? 'none' : `inset 0 0 0 1.6px ${item.color}`,
                  }}
                >
                  <LayerGlyph id={item.id} size={15} />
                </span>
                {item.label}
              </button>
              {/* Shade scale: opacity-stepped tiles echoing the canopy layer. */}
              {item.id === 'canopy' && (
                <div className={styles.toggleScale} data-on={on}>
                  <span className={styles.toggleTiles} aria-hidden>
                    {[0.18, 0.38, 0.58, 0.78].map((a) => (
                      <span key={a} style={{ background: `rgba(63, 155, 92, ${a})` }} />
                    ))}
                  </span>
                  → more shade
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
