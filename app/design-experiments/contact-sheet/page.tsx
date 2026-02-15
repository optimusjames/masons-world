'use client'

import { useState, useRef, useCallback } from 'react'
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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
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
                    onClick={() => setLightboxSrc(img.url)}
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
        className={`lightbox${lightboxSrc ? ' open' : ''}`}
        onClick={() => setLightboxSrc(null)}
      >
        {lightboxSrc && <img src={lightboxSrc} alt="" />}
      </div>
    </div>
  )
}
