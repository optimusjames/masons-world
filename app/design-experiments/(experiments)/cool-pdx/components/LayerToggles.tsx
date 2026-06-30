'use client'

import styles from '../styles.module.css'
import type { LayerId } from '../types'

type Props = {
  visibleLayers: LayerId[]
  onToggle: (id: LayerId) => void
}

const ITEMS: { id: LayerId; label: string; color: string; dot?: boolean }[] = [
  { id: 'canopy', label: 'Tree canopy', color: '#3f9b5c' },
  { id: 'fountains', label: 'Drinking water', color: '#2b8fd0', dot: true },
  { id: 'cooling', label: 'Cool air', color: '#6366f1', dot: true },
]

export default function LayerToggles({ visibleLayers, onToggle }: Props) {
  return (
    <div className={styles.toggles}>
      {ITEMS.map((item) => {
        const on = visibleLayers.includes(item.id)
        return (
          <button
            key={item.id}
            type="button"
            className={styles.toggle}
            data-on={on}
            aria-pressed={on}
            onClick={() => onToggle(item.id)}
          >
            <span
              className={`${styles.swatch} ${item.dot ? styles.swatchDot : ''}`}
              style={{ background: item.color }}
            />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
