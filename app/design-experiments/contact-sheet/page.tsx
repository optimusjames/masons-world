'use client'

import { useState, useRef, useCallback } from 'react'
import { SwissFrame } from '../components/SwissFrame'
import { ContactSheet } from './components/ContactSheet'
import type { ImageEntry } from './types'
import styles from './page.module.css'

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg|bmp|tiff?)$/i

export default function ContactSheetPage() {
  const [images, setImages] = useState<ImageEntry[]>([])
  const [folderName, setFolderName] = useState('')
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

  const hasImages = images.length > 0

  return (
    <div className={styles.page}>
      <SwissFrame
        logo="Contact Sheet"
        meta="Image Browser"
        subLabels={[
          hasImages ? `${images.length} images` : 'No folder selected',
          hasImages ? folderName : 'Local only',
          'Nothing uploaded',
        ]}
        footerLabels={['Client-side only', 'WebkitDirectory API', 'JSZip export']}
        fluid
      >
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
          <div className={styles.picker}>
            <button className={styles.pickerButton} onClick={openPicker}>
              Choose Folder
            </button>
            <p className={styles.pickerLabel}>
              Pick any folder of images from your device. Nothing gets uploaded -- everything stays in your browser.
            </p>
          </div>
        )}

        {hasImages && (
          <ContactSheet
            images={images}
            title={folderName}
            className={styles.sheet}
            headerExtra={
              <button className={styles.changeBtn} onClick={openPicker}>
                Change Folder
              </button>
            }
          />
        )}
      </SwissFrame>
    </div>
  )
}
