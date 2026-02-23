'use client'

import { useEffect, useRef, useState } from 'react'
import { Space_Mono } from 'next/font/google'
import s from './styles.module.css'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-mono',
})

export default function GeistPixelPage() {
  const [currentVariant, setCurrentVariant] = useState('square')
  const scrambleContainerRef = useRef<HTMLDivElement>(null)

  const variants: Record<string, string> = {
    square: "'Geist Pixel Square', monospace",
    grid: "'Geist Pixel Grid', monospace",
    circle: "'Geist Pixel Circle', monospace",
    triangle: "'Geist Pixel Triangle', monospace",
    line: "'Geist Pixel Line', monospace"
  }

  const handleVariantChange = (variant: string) => {
    setCurrentVariant(variant)
    document.documentElement.style.setProperty('--font-display', variants[variant])
  }

  useEffect(() => {
    // Initialize variant
    document.documentElement.style.setProperty('--font-display', variants[currentVariant])

    // Text Scramble Effect - Split-flap / Solari board style
    class TextScramble {
      el: HTMLElement
      intervalId: ReturnType<typeof setInterval> | null
      resolveCallback: (() => void) | null
      isResolving: boolean
      finalText: string
      resolved: number

      constructor(el: HTMLElement) {
        this.el = el
        this.intervalId = null
        this.resolveCallback = null
        this.isResolving = false
        this.finalText = ''
        this.resolved = 0
      }

      scramble(finalText: string) {
        this.finalText = finalText
        this.resolved = 0
        this.isResolving = false

        if (this.intervalId) clearInterval(this.intervalId)
        this.intervalId = setInterval(() => this.tick(), 20)
      }

      resolve() {
        return new Promise<void>(resolve => {
          this.resolveCallback = resolve
          this.isResolving = true
        })
      }

      tick() {
        if (this.isResolving && this.resolved < this.finalText.length) {
          this.resolved += 3
        }

        let output = ''
        const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const numChars = '0123456789'

        for (let i = 0; i < this.finalText.length; i++) {
          if (i < this.resolved) {
            output += this.finalText[i]
          } else {
            const finalChar = this.finalText[i]
            if (finalChar === ' ' || /[.,!?:;]/.test(finalChar)) {
              output += allChars[Math.floor(Math.random() * allChars.length)]
            } else if (finalChar >= '0' && finalChar <= '9') {
              output += numChars[Math.floor(Math.random() * numChars.length)]
            } else {
              output += upperChars[Math.floor(Math.random() * upperChars.length)]
            }
          }
        }

        this.el.textContent = output

        if (this.isResolving && this.resolved >= this.finalText.length) {
          if (this.intervalId) clearInterval(this.intervalId)
          this.intervalId = null
          if (this.resolveCallback) this.resolveCallback()
        }
      }

      stop() {
        if (this.intervalId) {
          clearInterval(this.intervalId)
          this.intervalId = null
        }
      }
    }

    const lines = [
      "SYSTEM INTERFACE V4.7.2 INITIALIZED. NEURAL PATHWAY CALIBRATION COMPLETE.",
      "BIOMETRIC SCAN AUTHENTICATED. ALL SUBSYSTEMS NOMINAL. MEMORY ALLOCATION:",
      "847.3 TB AVAILABLE. QUANTUM PROCESSING CORES ONLINE. AWAITING COMMAND",
      "SEQUENCE. WARNING: REPLICANT DETECTION PROTOCOLS ACTIVE. VOIGHT-KAMPFF",
      "BASELINE ESTABLISHED. ENVIRONMENTAL SENSORS DETECTING ELEVATED ATMOSPHERIC",
      "PARTICULATES. RECOMMEND SWITCHING TO THERMAL OVERLAY. OFF-WORLD TRANSPORT",
      "DEPARTING BAY 7 AT 0600. SPINNER CLEARANCE GRANTED FOR ALL SECTORS."
    ]

    const container = scrambleContainerRef.current
    let scrambleInstances: TextScramble[] = []
    let lineElements: HTMLElement[] = []

    function buildLines() {
      if (!container) return
      container.innerHTML = ''
      lineElements = []

      lines.forEach((text, i) => {
        const wrapper = document.createElement('div')
        wrapper.className = s['scramble-line']

        const placeholder = document.createElement('span')
        placeholder.className = s['scramble-placeholder']
        placeholder.textContent = text

        const animated = document.createElement('span')
        animated.className = s['scramble-text']
        animated.dataset.text = text
        animated.id = `line-${i}`

        wrapper.appendChild(placeholder)
        wrapper.appendChild(animated)
        container.appendChild(wrapper)

        lineElements.push(animated)
      })
    }

    function runScramble() {
      scrambleInstances.forEach(inst => inst.stop())
      scrambleInstances = []

      lineElements.forEach((el) => {
        const scramble = new TextScramble(el)
        scrambleInstances.push(scramble)
        scramble.scramble(el.dataset.text ?? '')
      })

      setTimeout(() => {
        let currentLine = 0

        function resolveNextLine() {
          if (currentLine < scrambleInstances.length) {
            scrambleInstances[currentLine].resolve().then(() => {
              currentLine++
              resolveNextLine()
            })
          }
        }

        resolveNextLine()
      }, 1000)
    }

    buildLines()
    const initialTimer = setTimeout(runScramble, 500)

    const handleClick = () => {
      runScramble()
    }

    if (container) {
      container.addEventListener('click', handleClick)
    }

    return () => {
      clearTimeout(initialTimer)
      scrambleInstances.forEach(inst => inst.stop())
      if (container) {
        container.removeEventListener('click', handleClick)
      }
    }
  }, [])

  const comparisonVariants: Record<string, string> = {
    square: s.comparisonSquare,
    grid: s.comparisonGrid,
    circle: s.comparisonCircle,
    triangle: s.comparisonTriangle,
    line: s.comparisonLine,
  }

  return (
    <div className={spaceMono.variable}>
      <div className={s.container}>
        <header className={s.gpHeader}>
          <div className={s.masthead}>
            <h1 className={s.title}>Geist Pixel</h1>
            <p className={s.subtitle}>A pixel typeface by Vercel</p>
          </div>
          <div className={s['meta-info']}>
            <div className={s['meta-item']}>
              <span>Variants</span>
              <span className={s['meta-value']}>5</span>
            </div>
            <div className={s['meta-item']}>
              <span>Glyphs</span>
              <span className={s['meta-value']}>480</span>
            </div>
          </div>
        </header>

        <nav className={s['variant-selector']}>
          {(['square', 'grid', 'circle', 'triangle', 'line'] as const).map(v => (
            <button
              key={v}
              className={`${s['variant-btn']} ${currentVariant === v ? s.variantBtnActive : ''}`}
              onClick={() => handleVariantChange(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </nav>

        <section className={s['type-hero']}>
          <div className={s['type-hero-text']}>Aa</div>
          <div className={`${s['type-hero-copy']} ${s.scrambleContainer}`} ref={scrambleContainerRef}></div>
        </section>

        <div className={s.divider}></div>

        <section className={s['size-scale']}>
          <div className={s['section-title']}>Size Scale</div>
          {[72, 60, 48, 36, 24, 18, 14].map(size => (
            <div key={size} className={s['size-scale-item']}>
              <span className={s['size-label']}>{size}</span>
              <span className={`${s['size-sample']} ${s[`size-${size}`]}`}>
                {size >= 36 ? 'Hamburgefons' : size >= 24 ? 'Hamburgefonstiv' : 'The quick brown fox jumps over the lazy dog' + (size === 14 ? '. Pack my box with five dozen liquor jugs.' : '')}
              </span>
            </div>
          ))}
        </section>

        <div className={s.divider}></div>

        <section className={s.charset}>
          <div className={s['section-title']}>Character Set</div>
          <div className={s['charset-display']}>
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </div>
          <div className={`${s['charset-display']} ${s['charset-lower']}`}>
            abcdefghijklmnopqrstuvwxyz
          </div>
          <div className={`${s['charset-display']} ${s['charset-numbers']}`}>
            0123456789
          </div>
          <div className={`${s['charset-display']} ${s['charset-symbols']}`}>
            {'!@#$%^&*(){}[]|:;"\'<>,.?/'}
          </div>
        </section>

        <div className={s.divider}></div>

        <section className={s.comparison}>
          <div className={s['section-title']}>Variant Comparison</div>
          {['square', 'grid', 'circle', 'triangle', 'line'].map(v => (
            <div key={v} className={s['comparison-row']}>
              <span className={s['comparison-label']}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
              <span className={`${s['comparison-sample']} ${comparisonVariants[v]}`}>The quick brown fox</span>
            </div>
          ))}
        </section>

        <div className={s.divider}></div>

        <section>
          <div className={s['section-title']}>Sample Text</div>
          <div className={s['sample-block']}>
            <p className={s['sample-text']}>
              Geist Pixel is a bitmap-inspired typeface designed for digital interfaces.
              Each variant offers a unique pixel treatment while maintaining legibility.
              Built for banners, dashboards, and experimental layouts.
            </p>
          </div>
        </section>

        <footer className={s.gpFooter}>
          <div className={s['footer-left']}>
            Design Experiment / 2026
          </div>
          <div className={s['footer-right']}>
            <a href="https://vercel.com/font" target="_blank" rel="noopener">vercel.com/font</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
