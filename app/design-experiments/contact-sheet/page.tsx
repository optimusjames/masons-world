'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import './styles.css'

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg|bmp|tiff?)$/i

interface ImageEntry {
  name: string
  size: number
  url: string
  relPath: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

export default function ContactSheet() {
  const [images, setImages] = useState<ImageEntry[]>([])
  const [folderName, setFolderName] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const copyPath = async (path: string, id: string) => {
    await navigator.clipboard.writeText(path)
    flash(id)
  }

  const copyImage = async (blobUrl: string, id: string) => {
    const resp = await fetch(blobUrl)
    const blob = await resp.blob()

    if (blob.type === 'image/png') {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    } else {
      const img = new Image()
      img.src = blobUrl
      await img.decode()
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      c.getContext('2d')!.drawImage(img, 0, 0)
      const pngBlob = await new Promise<Blob>(r => c.toBlob(b => r(b!), 'image/png'))
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })])
    }
    flash(id)
  }

  const lightboxOpen = lightboxIndex !== null
  const lightboxImage = lightboxOpen ? images[lightboxIndex] : null

  const lightboxPrev = () => {
    setLightboxIndex(i => i === null ? null : i === 0 ? images.length - 1 : i - 1)
  }

  const lightboxNext = () => {
    setLightboxIndex(i => i === null ? null : i === images.length - 1 ? 0 : i + 1)
  }

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const hasImages = images.length > 0

  return (
    <div className="contact-sheet">
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
              <figure key={img.url} className="cell">
                <div className="image-well">
                  <img
                    src={img.url}
                    alt={img.name}
                    loading="lazy"
                    onClick={() => setLightboxIndex(i)}
                  />
                  <div className="actions">
                    <button
                      className={copiedId === `path-${i}` ? 'copied' : ''}
                      onClick={e => { e.stopPropagation(); copyPath(img.relPath, `path-${i}`) }}
                    >
                      {copiedId === `path-${i}` ? 'Copied' : 'Copy Path'}
                    </button>
                    <button
                      className={copiedId === `img-${i}` ? 'copied' : ''}
                      onClick={e => { e.stopPropagation(); copyImage(img.url, `img-${i}`) }}
                    >
                      {copiedId === `img-${i}` ? 'Copied' : 'Copy Image'}
                    </button>
                  </div>
                </div>
                <figcaption>
                  {img.name} <span className="size">{formatSize(img.size)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      <div
        className={`lightbox${lightboxOpen ? ' open' : ''}`}
        onClick={() => setLightboxIndex(null)}
      >
        {lightboxImage && (
          <>
            <button className="lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); lightboxPrev() }} aria-label="Previous image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
              <img src={lightboxImage.url} alt={lightboxImage.name} />
              <p className="lightbox-caption">{lightboxImage.name}</p>
              <div className="lightbox-actions">
                <button
                  className={copiedId === `lb-path` ? 'copied' : ''}
                  onClick={() => copyPath(lightboxImage.relPath, 'lb-path')}
                >
                  {copiedId === 'lb-path' ? 'Copied' : 'Copy Path'}
                </button>
                <button
                  className={copiedId === `lb-img` ? 'copied' : ''}
                  onClick={() => copyImage(lightboxImage.url, 'lb-img')}
                >
                  {copiedId === 'lb-img' ? 'Copied' : 'Copy Image'}
                </button>
              </div>
            </div>
            <button className="lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); lightboxNext() }} aria-label="Next image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
