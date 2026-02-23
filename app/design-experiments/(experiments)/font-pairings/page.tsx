'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { pairings, quote, text } from './data/pairings'
import type { FontPairing } from './data/pairings'
import './styles.css'

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Instrument+Serif:ital@0;1&family=Albert+Sans:wght@300;400;500;600&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=Gambarino&family=Hanken+Grotesk:wght@300;400;500;600&family=Syne:wght@400;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Space+Grotesk:wght@400;600;700&family=Spectral:ital,wght@0,400;0,600;1,400&family=Young+Serif&family=Karla:ital,wght@0,300;0,400;0,500;1,400&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@300;400;500;600&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&family=DM+Serif+Display:ital@0;1&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;0,6..96,900;1,6..96,400&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;1,400&family=Anybody:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;700&family=Darker+Grotesque:wght@400;500;700;900&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Schibsted+Grotesk:wght@400;500;700&family=Vollkorn:ital,wght@0,400;0,600;0,700;1,400&family=Chivo:wght@300;400;700&family=Sorts+Mill+Goudy:ital@0;1&family=Figtree:wght@300;400;500;700&family=Bitter:wght@400;500;700&family=Commissioner:wght@300;400;500;700&family=Sora:wght@300;400;600;700&family=Manrope:wght@300;400;500;700&family=Space+Mono:wght@400;700&family=Unbounded:wght@400;700;900&family=Zilla+Slab:wght@400;600;700&family=Nunito+Sans:wght@300;400;600&family=PT+Serif:ital,wght@0,400;0,700;1,400&family=PT+Sans:wght@400;700&family=Red+Hat+Display:wght@400;700;900&family=Red+Hat+Text:wght@300;400;500&family=Josefin+Slab:wght@300;400;600;700&family=Josefin+Sans:wght@300;400;600&family=Libre+Caslon+Display&family=Libre+Franklin:wght@300;400;500&family=Funnel+Display:wght@400;700&family=Funnel+Sans:wght@300;400;500&family=Overpass+Mono:wght@400;600;700&family=Overpass:wght@300;400;600&family=Rethink+Sans:wght@400;600;700&family=Quattrocento:wght@400;700&family=Quattrocento+Sans:wght@400;700&family=Geist:wght@300;400;500;700&display=swap'

function buildSpec(p: FontPairing): string {
  const name = p.heading === p.body ? p.heading : `${p.heading} + ${p.body}`
  return `Font pairing: ${name}\nHeading: ${p.heading} (weights: ${p.hWeights})\nBody: ${p.body} (weights: ${p.bWeights})\nClassification: ${p.classification}`
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function PairingCard({ pairing, index, onCopy }: { pairing: FontPairing; index: number; onCopy: (name: string) => void }) {
  const [flipped, setFlipped] = useState(false)
  const [copied, setCopied] = useState(false)
  const num = String(index + 1).padStart(2, '0')
  const name = pairing.heading === pairing.body ? pairing.heading : `${pairing.heading} + ${pairing.body}`

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const spec = buildSpec(pairing)
    navigator.clipboard.writeText(spec).then(() => {
      setCopied(true)
      onCopy(name)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [pairing, name, onCopy])

  return (
    <div className="cardWrapper" onClick={() => setFlipped((f) => !f)}>
      <div className={`card${flipped ? ' flipped' : ''}`}>
        <div className="cardFront" style={{ background: pairing.bg, color: pairing.fg }}>
          <button className="copyIcon" title="Copy font spec" onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          <div className="cardNumber">{num}</div>
          <div className="pairingName">{name}</div>
          <h2 className="headingSample" style={pairing.hStyle}>{quote}</h2>
          <p className="bodySample" style={pairing.bStyle}>{text}</p>
        </div>
        <div className="cardBack" style={{ background: pairing.bg, color: pairing.fg }}>
          <button className="copyIcon" title="Copy font spec" onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          <div className="backLabel">Font Spec</div>
          <div className="specBlock">
            <strong>Font pairing: {name}</strong>
            {'\n'}Heading: {pairing.heading} (weights: {pairing.hWeights})
            {'\n'}Body: {pairing.body} (weights: {pairing.bWeights})
            {'\n'}Classification: {pairing.classification}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FontPairingsPage() {
  const [fontsReady, setFontsReady] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    let cancelled = false

    // Inject stylesheet into <head> and wait for it to load
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = GOOGLE_FONTS_URL
    link.onload = () => {
      // CSS loaded — now wait for actual font files to finish
      document.fonts.ready.then(() => {
        if (!cancelled) setFontsReady(true)
      })
    }
    link.onerror = () => {
      if (!cancelled) setFontsReady(true) // show page anyway
    }
    document.head.appendChild(link)

    // Fallback: show page after 5s no matter what
    const fallback = setTimeout(() => { if (!cancelled) setFontsReady(true) }, 5000)

    return () => {
      cancelled = true
      clearTimeout(fallback)
    }
  }, [])

  const handleCopy = useCallback((name: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(`Copied: ${name}`)
    timerRef.current = setTimeout(() => setToast(null), 2000)
  }, [])

  return (
    <div className="page">
      {!fontsReady && (
        <div className="loadingScreen">
          <span className="loadingText">Loading fonts...</span>
        </div>
      )}
      <div className={`grid${fontsReady ? ' ready' : ''}`}>
        {pairings.map((p, i) => (
          <PairingCard key={`${p.heading}-${p.body}-${i}`} pairing={p} index={i} onCopy={handleCopy} />
        ))}
      </div>
      <div className={`toast${toast ? ' visible' : ''}`}>{toast}</div>
    </div>
  )
}
