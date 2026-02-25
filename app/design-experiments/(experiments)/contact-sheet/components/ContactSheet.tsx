'use client'

import { useState, useCallback } from 'react'
import JSZip from 'jszip'
import type { ImageEntry } from '../types'
import styles from './ContactSheet.module.css'

interface ContactSheetProps {
  images: ImageEntry[]
  title?: string
  className?: string
  headerExtra?: React.ReactNode
  onSelectionChange?: (selected: ImageEntry[]) => void
}

export function ContactSheet({
  images,
  title = 'Images',
  className,
  headerExtra,
  onSelectionChange,
}: ContactSheetProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const sidebarOpen = selected.size > 0

  const updateSelection = useCallback(
    (next: Set<number>) => {
      setSelected(next)
      onSelectionChange?.(
        [...next].sort((a, b) => a - b).map(i => images[i])
      )
    },
    [images, onSelectionChange]
  )

  const toggleSelect = (index: number) => {
    const next = new Set(selected)
    if (next.has(index)) next.delete(index)
    else next.add(index)
    updateSelection(next)
  }

  const clearSelection = () => updateSelection(new Set())

  const flash = (id: string) => {
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1200)
  }

  const copySelectedList = async () => {
    const names = [...selected]
      .sort((a, b) => a - b)
      .map(i => images[i].name)
      .join('\n')
    await navigator.clipboard.writeText(names)
    flash('sidebar-copy')
  }

  const downloadSelected = async () => {
    const zip = new JSZip()
    const sorted = [...selected].sort((a, b) => a - b)
    for (const i of sorted) {
      const resp = await fetch(images[i].url)
      const blob = await resp.blob()
      zip.file(images[i].name, blob)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = `${sorted.length}-image-selects.zip`
    a.click()
    URL.revokeObjectURL(a.href)
    flash('sidebar-download')
  }

  const root = [styles.root, sidebarOpen ? styles.sidebarOpen : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={root}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.headerRight}>
          <span className={styles.meta}>{images.length} images</span>
          {headerExtra}
        </div>
      </div>

      <div className={styles.grid}>
        {images.map((img, i) => (
          <figure
            key={img.url}
            className={`${styles.cell}${selected.has(i) ? ` ${styles.selected}` : ''}`}
            onClick={() => toggleSelect(i)}
          >
            <div className={styles.imageWell}>
              <img src={img.url} alt={img.name} loading="lazy" />
            </div>
            <figcaption className={styles.caption}>
              <span className={styles.captionText}>{img.name}</span>
              <span
                className={`${styles.selectCheck}${selected.has(i) ? ` ${styles.checked}` : ''}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7L6 10L11 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className={`${styles.sidebar}${sidebarOpen ? ` ${styles.open}` : ''}`}>
        <div className={styles.sidebarHeader}>
          <span>{selected.size} selected</span>
          <div className={styles.sidebarActions}>
            <button
              className={copiedId === 'sidebar-copy' ? styles.copied : undefined}
              onClick={copySelectedList}
            >
              {copiedId === 'sidebar-copy' ? 'Copied' : 'Copy List'}
            </button>
            <button
              className={copiedId === 'sidebar-download' ? styles.copied : undefined}
              onClick={downloadSelected}
            >
              {copiedId === 'sidebar-download' ? 'Saved' : 'Download'}
            </button>
            <button onClick={clearSelection}>Clear</button>
          </div>
        </div>
        <ul className={styles.sidebarList}>
          {[...selected].sort((a, b) => a - b).map(i => (
            <li key={i} className={styles.sidebarItem}>
              <img className={styles.sidebarThumb} src={images[i]?.url} alt="" aria-hidden="true" />
              <span className={styles.sidebarFilename}>{images[i]?.name}</span>
              <button
                className={styles.sidebarRemove}
                onClick={() => toggleSelect(i)}
                aria-label="Remove"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
