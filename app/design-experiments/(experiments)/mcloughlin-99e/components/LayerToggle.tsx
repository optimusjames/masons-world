'use client'

import styles from '../styles.module.css'
import type { LayerId } from '../types'

export type LayerSwatchShape = 'line' | 'lineDashed' | 'lineSoft' | 'dot'

export type LayerOption = {
  id: LayerId
  label: string
  color: string
  shape: LayerSwatchShape
}

type Props = {
  layers: LayerOption[]
  visible: LayerId[]
  onToggle: (id: LayerId) => void
}

export default function LayerToggle({ layers, visible, onToggle }: Props) {
  return (
    <div className={styles.toggleGroup}>
      {layers.map((layer) => {
        const isActive = visible.includes(layer.id)
        return (
          <button
            key={layer.id}
            type="button"
            className={`${styles.toggle} ${isActive ? styles.toggleActive : ''}`}
            onClick={() => onToggle(layer.id)}
            aria-pressed={isActive}
          >
            <Swatch shape={layer.shape} color={layer.color} />
            {layer.label}
          </button>
        )
      })}
    </div>
  )
}

function Swatch({ shape, color }: { shape: LayerSwatchShape; color: string }) {
  if (shape === 'dot') {
    return (
      <span
        className={styles.swatchDot}
        style={{ background: color }}
        aria-hidden
      />
    )
  }
  if (shape === 'lineSoft') {
    return (
      <span className={styles.swatchLineWrap} aria-hidden>
        <span
          className={styles.swatchLineSoft}
          style={{ background: color }}
        />
      </span>
    )
  }
  if (shape === 'lineDashed') {
    return (
      <span className={styles.swatchLineWrap} aria-hidden>
        <span
          className={styles.swatchLineDashed}
          style={{ borderColor: color }}
        />
      </span>
    )
  }
  return (
    <span className={styles.swatchLineWrap} aria-hidden>
      <span className={styles.swatchLine} style={{ background: color }} />
    </span>
  )
}
