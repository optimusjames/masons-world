'use client'

import { useState, useRef, useCallback } from 'react'
import JSZip from 'jszip'
import './styles.css'

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg|bmp|tiff?)$/i

interface ImageEntry {
  name: string
  size: number
  url: string
  relPath: string
}

export default function ContactSheet() {
  const [images, setImages] = useState<ImageEntry[]>([])
  const [folderName, setFolderName] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const sidebarOpen = selected.size > 0

  const toggleSelect = (index: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

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

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return

    const files = [...fileList]
      .filter(f => IMAGE_EXT.test(f.name))
      .sort((a, b) => b.lastModified - a.lastModified)

    if (!files.length) return

    const path = (files[0] as unknown as { webkitRelativePath: string }).webkitRelativePath || ''
    const folder = path.split('/')[0] || 'Images'
    setFolderName(folder)

    const entries: ImageEntry[] = files.map(f => ({
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
      relPath: (f as unknown as { webkitRelativePath: string }).webkitRelativePath || f.name,
    }))

    setImages(prev => {
      prev.forEach(img => URL.revokeObjectURL(img.url))
      return entries
    })
    setSelected(new Set())
  }, [])

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.click()
    }
  }

  const flash = (id: string) => {
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1200)
  }

  const hasImages = images.length > 0

  return (
    <div className={`contact-sheet${sidebarOpen ? ' sidebar-open' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        // @ts-expect-error webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        multiple
        hidden
        onChange={e => handleFiles(e.target.files)}
      />

      {!hasImages && (
        <div className="picker">
          <button onClick={openPicker}>Choose Folder</button>
          <p className="picker-label">
            Pick any folder of images from your device. Nothing gets uploaded -- everything stays in your browser.
          </p>
        </div>
      )}

      {hasImages && (
        <div>
          <div className="header">
            <h1>{folderName}</h1>
            <div className="header-right">
              <span className="meta">{images.length} images</span>
              <button className="change-btn" onClick={openPicker}>Change Folder</button>
            </div>
          </div>

          <div className="grid">
            {images.map((img, i) => (
              <figure
                key={img.url}
                className={`cell${selected.has(i) ? ' selected' : ''}`}
                onClick={() => toggleSelect(i)}
              >
                <div className="image-well">
                  <img
                    src={img.url}
                    alt={img.name}
                    loading="lazy"
                  />
                </div>
                <figcaption>
                  <span className="caption-text">
                    {img.name}
                  </span>
                  <span className={`select-check${selected.has(i) ? ' checked' : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <span>{selected.size} selected</span>
          <div className="sidebar-actions">
            <button
              className={copiedId === 'sidebar-copy' ? 'copied' : ''}
              onClick={copySelectedList}
            >
              {copiedId === 'sidebar-copy' ? 'Copied' : 'Copy List'}
            </button>
            <button
              className={copiedId === 'sidebar-download' ? 'copied' : ''}
              onClick={downloadSelected}
            >
              {copiedId === 'sidebar-download' ? 'Saved' : 'Download'}
            </button>
            <button onClick={clearSelection}>Clear</button>
          </div>
        </div>
        <ul className="sidebar-list">
          {[...selected].sort((a, b) => a - b).map(i => (
            <li key={i}>
              <img className="sidebar-thumb" src={images[i]?.url} alt="" />
              <span className="sidebar-filename">{images[i]?.name}</span>
              <button
                className="sidebar-remove"
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
