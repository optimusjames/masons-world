'use client'

import { useState, useRef, useCallback } from 'react'
import { ContactSheet } from './ContactSheet'
import type { ImageEntry } from '../types'
import styles from '../page.module.css'

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg|bmp|tiff?)$/i

const SAMPLE_DIR = '/design-experiments/contact-sheet'

// webkitRelativePath is a non-standard but widely supported File property
interface FileWithRelativePath extends File {
  readonly webkitRelativePath: string;
}

const SAMPLE_IMAGES: ImageEntry[] = [
  'basquiat-style-fashion-portrait.jpg',
  'bearded-man-pattern-illustration.jpg',
  'bird-face-closeup-portrait.jpg',
  'bird-floral-circle-logo.jpg',
  'bird-landscape-sage-logo.jpg',
  'chameleon-face-closeup-portrait.jpg',
  'fisheye-streetwear-urban.jpg',
  'greyhound-yawning-white.jpg',
  'skater-crosswalk-motion-blur.jpg',
].map(name => ({
  name,
  size: 0,
  url: `${SAMPLE_DIR}/${name}`,
  relPath: `samples/${name}`,
}))

export function ContactSheetBrowser() {
  const [images, setImages] = useState<ImageEntry[]>(SAMPLE_IMAGES)
  const [folderName, setFolderName] = useState('Sample Images')
  const [isSample, setIsSample] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return

    const files = ([...fileList] as FileWithRelativePath[])
      .filter(f => IMAGE_EXT.test(f.name))
      .sort((a, b) => b.lastModified - a.lastModified)

    if (!files.length) return

    const folder = files[0].webkitRelativePath.split('/')[0] || 'Images'
    setFolderName(folder)
    setIsSample(false)

    const entries: ImageEntry[] = files.map(f => ({
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
      relPath: f.webkitRelativePath || f.name,
    }))

    setImages(prev => {
      prev.forEach(img => {
        if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url)
      })
      return entries
    })
  }, [])

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.click()
    }
  }

  const resetToSamples = () => {
    setImages(prev => {
      prev.forEach(img => {
        if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url)
      })
      return SAMPLE_IMAGES
    })
    setFolderName('Sample Images')
    setIsSample(true)
  }

  return (
    <div className={styles.page}>
      <input
        ref={inputRef}
        type="file"
        // @ts-expect-error webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        multiple
        hidden
        onChange={e => handleFiles(e.target.files)}
      />

      {isSample && (
        <div className={styles.sampleBanner}>
          These are sample images. To try your own, click <button className={styles.bannerLink} onClick={openPicker}>change folder</button> and select a folder from your device.
        </div>
      )}

      <ContactSheet
        images={images}
        title={folderName}
        className={styles.sheet}
        headerExtra={
          <>
            <button className={styles.changeBtn} onClick={openPicker}>
              Change Folder
            </button>
            {!isSample && (
              <button className={styles.changeBtn} onClick={resetToSamples}>
                Clear
              </button>
            )}
          </>
        }
      />
    </div>
  )
}
