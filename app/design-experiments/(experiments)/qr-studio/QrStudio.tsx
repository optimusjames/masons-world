'use client'

import { useState, useRef, useCallback } from 'react'
import { Cormorant_Garamond, Space_Mono, DM_Sans } from 'next/font/google'
import BusinessCard from './components/BusinessCard'
import EventFlyer from './components/EventFlyer'
import ContentCard from './components/ContentCard'
import { contentItems } from './data'
import './styles.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  variable: '--font-cormorant',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-space-mono',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-dm-sans',
})

type Template = 'business-card' | 'event-flyer' | 'content-card'
type Theme = 'dark' | 'light'
type Side = 'front' | 'back'

const TEMPLATES: { id: Template; label: string; dims: string }[] = [
  { id: 'business-card', label: 'Business Card', dims: '3.5 × 2 in' },
  { id: 'event-flyer', label: 'Event Flyer', dims: 'A5 · 148 × 210 mm' },
  { id: 'content-card', label: 'Content Card', dims: '100 × 100 mm' },
]

export default function QrStudio() {
  const [template, setTemplate] = useState<Template>('business-card')
  const [theme, setTheme] = useState<Theme>('dark')
  const [side, setSide] = useState<Side>('front')
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null)

  // Business card fields
  const [bcName, setBcName] = useState('James Mason')
  const [bcTitle, setBcTitle] = useState('Designer & Developer')
  const [bcTagline, setBcTagline] = useState('Building thoughtful digital things.')
  const [bcUrl, setBcUrl] = useState('masons-world.vercel.app')

  // Event flyer fields
  const [efTitle, setEfTitle] = useState('Yoga in the Park')
  const [efSubtitle, setEfSubtitle] = useState('Free community class · All levels welcome')
  const [efDate, setEfDate] = useState('Saturday, June 7 · 9:00 AM')
  const [efLocation, setEfLocation] = useState('Laurelhurst Park, Portland')
  const [efDetails, setEfDetails] = useState('Bring your mat · No experience needed')
  const [efUrl, setEfUrl] = useState('masons-world.vercel.app')

  // Content card fields
  const [selectedId, setSelectedId] = useState(contentItems[0].id)
  const [ccTitle, setCcTitle] = useState(contentItems[0].title)
  const [ccDescription, setCcDescription] = useState(contentItems[0].description)

  const cardRef = useRef<HTMLDivElement>(null)

  const handleContentSelect = useCallback((id: string) => {
    const item = contentItems.find(c => c.id === id)
    if (!item) return
    setSelectedId(id)
    setCcTitle(item.title)
    setCcDescription(item.description)
  }, [])

  const selectedContent = contentItems.find(c => c.id === selectedId) ?? contentItems[0]

  const exportPng = useCallback(async () => {
    if (!cardRef.current || exporting) return
    setExporting('png')
    try {
      await document.fonts.ready
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = `${template}-${theme}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(null)
    }
  }, [template, theme, exporting])

  const exportPdf = useCallback(async () => {
    if (!cardRef.current || exporting) return
    setExporting('pdf')
    try {
      await document.fonts.ready
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      })
      const imgData = canvas.toDataURL('image/png')

      let doc: InstanceType<typeof jsPDF>
      let w: number, h: number

      if (template === 'business-card') {
        doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [88.9, 50.8] })
        w = 88.9; h = 50.8
      } else if (template === 'event-flyer') {
        doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
        w = 148; h = 210
      } else {
        doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [100, 100] })
        w = 100; h = 100
      }

      doc.addImage(imgData, 'PNG', 0, 0, w, h)
      doc.save(`${template}-${theme}.pdf`)
    } finally {
      setExporting(null)
    }
  }, [template, theme, exporting])

  const dark = theme === 'dark'

  return (
    <div className={`qrs ${cormorant.variable} ${spaceMono.variable} ${dmSans.variable}`}>
      {/* Header */}
      <header className="qrs__header">
        <p className="qrs__eyebrow">Design Experiment</p>
        <h1 className="qrs__title">QR Studio</h1>
        <p className="qrs__subtitle">
          Print-ready cards with styled QR codes. Customize, preview, download.
        </p>
      </header>

      {/* Studio */}
      <div className="qrs__studio">
        {/* Left — controls */}
        <aside className="qrs__controls">
          {/* Template picker */}
          <div className="qrs__section">
            <label className="qrs__label">Format</label>
            <div className="qrs__template-picker">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  className={`qrs__template-btn ${template === t.id ? 'qrs__template-btn--active' : ''}`}
                  onClick={() => setTemplate(t.id)}
                >
                  <span className="qrs__template-name">{t.label}</span>
                  <span className="qrs__template-dims">{t.dims}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme toggle */}
          <div className="qrs__section">
            <label className="qrs__label">Theme</label>
            <div className="qrs__toggle">
              <button
                className={`qrs__toggle-btn ${theme === 'dark' ? 'qrs__toggle-btn--active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
              <button
                className={`qrs__toggle-btn ${theme === 'light' ? 'qrs__toggle-btn--active' : ''}`}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
            </div>
          </div>

          <div className="qrs__divider" />

          {/* Dynamic fields */}
          {template === 'business-card' && (
            <>
              <div className="qrs__section">
                <label className="qrs__label">Side</label>
                <div className="qrs__toggle">
                  <button className={`qrs__toggle-btn ${side === 'front' ? 'qrs__toggle-btn--active' : ''}`} onClick={() => setSide('front')}>Front</button>
                  <button className={`qrs__toggle-btn ${side === 'back' ? 'qrs__toggle-btn--active' : ''}`} onClick={() => setSide('back')}>Back</button>
                </div>
              </div>
              <div className="qrs__fields">
                <div className="qrs__field">
                  <label className="qrs__field-label">Name</label>
                  <input className="qrs__input" value={bcName} onChange={e => setBcName(e.target.value)} />
                </div>
                <div className="qrs__field">
                  <label className="qrs__field-label">Title</label>
                  <input className="qrs__input" value={bcTitle} onChange={e => setBcTitle(e.target.value)} />
                </div>
                <div className="qrs__field">
                  <label className="qrs__field-label">Tagline (back)</label>
                  <input className="qrs__input" value={bcTagline} onChange={e => setBcTagline(e.target.value)} />
                </div>
                <div className="qrs__field">
                  <label className="qrs__field-label">URL</label>
                  <input className="qrs__input" value={bcUrl} onChange={e => setBcUrl(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {template === 'event-flyer' && (
            <div className="qrs__fields">
              <div className="qrs__field">
                <label className="qrs__field-label">Title</label>
                <input className="qrs__input" value={efTitle} onChange={e => setEfTitle(e.target.value)} />
              </div>
              <div className="qrs__field">
                <label className="qrs__field-label">Subtitle</label>
                <input className="qrs__input" value={efSubtitle} onChange={e => setEfSubtitle(e.target.value)} />
              </div>
              <div className="qrs__field">
                <label className="qrs__field-label">Date & Time</label>
                <input className="qrs__input" value={efDate} onChange={e => setEfDate(e.target.value)} />
              </div>
              <div className="qrs__field">
                <label className="qrs__field-label">Location</label>
                <input className="qrs__input" value={efLocation} onChange={e => setEfLocation(e.target.value)} />
              </div>
              <div className="qrs__field">
                <label className="qrs__field-label">Details</label>
                <input className="qrs__input" value={efDetails} onChange={e => setEfDetails(e.target.value)} />
              </div>
              <div className="qrs__field">
                <label className="qrs__field-label">URL</label>
                <input className="qrs__input" value={efUrl} onChange={e => setEfUrl(e.target.value)} />
              </div>
            </div>
          )}

          {template === 'content-card' && (
            <div className="qrs__fields">
              <div className="qrs__field">
                <label className="qrs__field-label">Content</label>
                <select className="qrs__select" value={selectedId} onChange={e => handleContentSelect(e.target.value)}>
                  {contentItems.map(item => (
                    <option key={item.id} value={item.id}>
                      [{item.type.toUpperCase()}] {item.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="qrs__field">
                <label className="qrs__field-label">Title</label>
                <input className="qrs__input" value={ccTitle} onChange={e => setCcTitle(e.target.value)} />
              </div>
              <div className="qrs__field">
                <label className="qrs__field-label">Description</label>
                <textarea className="qrs__textarea" value={ccDescription} onChange={e => setCcDescription(e.target.value)} rows={3} />
              </div>
            </div>
          )}

          <div className="qrs__divider" />

          {/* Export */}
          <div className="qrs__section">
            <label className="qrs__label">Export</label>
            <div className="qrs__export-btns">
              <button className="qrs__export-btn" onClick={exportPng} disabled={!!exporting}>
                {exporting === 'png' ? 'Generating…' : 'Download PNG'}
              </button>
              <button className="qrs__export-btn qrs__export-btn--secondary" onClick={exportPdf} disabled={!!exporting}>
                {exporting === 'pdf' ? 'Generating…' : 'Download PDF'}
              </button>
            </div>
            <p className="qrs__export-note">
              PNG · 3× resolution for print. PDF · vector-ready for print shops.
            </p>
          </div>
        </aside>

        {/* Right — preview */}
        <div className="qrs__preview">
          <div className="qrs__preview-inner">
            {template === 'business-card' && (
              <BusinessCard
                ref={cardRef}
                name={bcName}
                title={bcTitle}
                tagline={bcTagline}
                url={bcUrl}
                dark={dark}
                side={side}
              />
            )}
            {template === 'event-flyer' && (
              <EventFlyer
                ref={cardRef}
                title={efTitle}
                subtitle={efSubtitle}
                date={efDate}
                location={efLocation}
                details={efDetails}
                url={efUrl}
                dark={dark}
              />
            )}
            {template === 'content-card' && (
              <ContentCard
                ref={cardRef}
                title={ccTitle}
                description={ccDescription}
                url={selectedContent.url}
                image={selectedContent.image}
                type={selectedContent.type}
                dark={dark}
              />
            )}
          </div>
          <p className="qrs__preview-label">
            {TEMPLATES.find(t => t.id === template)?.label} · {TEMPLATES.find(t => t.id === template)?.dims}
          </p>
        </div>
      </div>
    </div>
  )
}
