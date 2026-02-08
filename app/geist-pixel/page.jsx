'use client'

import { useEffect, useRef, useState } from 'react'
import { Space_Mono } from 'next/font/google'
import './styles.css'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-mono',
})

export default function GeistPixelPage() {
  const [currentVariant, setCurrentVariant] = useState('square')
  const scrambleContainerRef = useRef(null)

  const variants = {
    square: "'Geist Pixel Square', monospace",
    grid: "'Geist Pixel Grid', monospace",
    circle: "'Geist Pixel Circle', monospace",
    triangle: "'Geist Pixel Triangle', monospace",
    line: "'Geist Pixel Line', monospace"
  }

  const handleVariantChange = (variant) => {
    setCurrentVariant(variant)
    document.documentElement.style.setProperty('--font-display', variants[variant])
  }

  useEffect(() => {
    // Initialize variant
    document.documentElement.style.setProperty('--font-display', variants[currentVariant])

    // Text Scramble Effect - Split-flap / Solari board style
    class TextScramble {
      constructor(el) {
        this.el = el
        this.intervalId = null
        this.resolveCallback = null
        this.isResolving = false
      }

      scramble(finalText) {
        this.finalText = finalText
        this.resolved = 0
        this.isResolving = false

        if (this.intervalId) clearInterval(this.intervalId)
        this.intervalId = setInterval(() => this.tick(), 20)
      }

      resolve() {
        return new Promise(resolve => {
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
          clearInterval(this.intervalId)
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
    let scrambleInstances = []
    let lineElements = []

    function buildLines() {
      if (!container) return
      container.innerHTML = ''
      lineElements = []

      lines.forEach((text, i) => {
        const wrapper = document.createElement('div')
        wrapper.className = 'scramble-line'

        const placeholder = document.createElement('span')
        placeholder.className = 'scramble-placeholder'
        placeholder.textContent = text

        const animated = document.createElement('span')
        animated.className = 'scramble-text'
        animated.dataset.text = text
        animated.id = `line-${i}`

        wrapper.appendChild(placeholder)
        wrapper.appendChild(animated)
        container.appendChild(wrapper)

        lineElements.push(animated)
      })
    }

    function runScramble() {
      scrambleInstances.forEach(s => s.stop())
      scrambleInstances = []

      lineElements.forEach((el) => {
        const scramble = new TextScramble(el)
        scrambleInstances.push(scramble)
        scramble.scramble(el.dataset.text)
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
      scrambleInstances.forEach(s => s.stop())
      if (container) {
        container.removeEventListener('click', handleClick)
      }
    }
  }, [])

  return (
    <div className={spaceMono.variable}>
      <div className="container">
        <header>
          <div className="masthead">
            <h1 className="title">Geist Pixel</h1>
            <p className="subtitle">A pixel typeface by Vercel</p>
          </div>
          <div className="meta-info">
            <div className="meta-item">
              <span>Variants</span>
              <span className="meta-value">5</span>
            </div>
            <div className="meta-item">
              <span>Glyphs</span>
              <span className="meta-value">480</span>
            </div>
          </div>
        </header>

        <nav className="variant-selector">
          <button
            className={`variant-btn ${currentVariant === 'square' ? 'active' : ''}`}
            onClick={() => handleVariantChange('square')}
          >
            Square
          </button>
          <button
            className={`variant-btn ${currentVariant === 'grid' ? 'active' : ''}`}
            onClick={() => handleVariantChange('grid')}
          >
            Grid
          </button>
          <button
            className={`variant-btn ${currentVariant === 'circle' ? 'active' : ''}`}
            onClick={() => handleVariantChange('circle')}
          >
            Circle
          </button>
          <button
            className={`variant-btn ${currentVariant === 'triangle' ? 'active' : ''}`}
            onClick={() => handleVariantChange('triangle')}
          >
            Triangle
          </button>
          <button
            className={`variant-btn ${currentVariant === 'line' ? 'active' : ''}`}
            onClick={() => handleVariantChange('line')}
          >
            Line
          </button>
        </nav>

        <section className="type-hero">
          <div className="type-hero-text">Aa</div>
          <div className="type-hero-copy" ref={scrambleContainerRef}></div>
        </section>

        <div className="divider"></div>

        <section className="size-scale">
          <div className="section-title">Size Scale</div>
          <div className="size-scale-item">
            <span className="size-label">72</span>
            <span className="size-sample size-72">Hamburgefons</span>
          </div>
          <div className="size-scale-item">
            <span className="size-label">60</span>
            <span className="size-sample size-60">Hamburgefons</span>
          </div>
          <div className="size-scale-item">
            <span className="size-label">48</span>
            <span className="size-sample size-48">Hamburgefonstiv</span>
          </div>
          <div className="size-scale-item">
            <span className="size-label">36</span>
            <span className="size-sample size-36">Hamburgefonstiv</span>
          </div>
          <div className="size-scale-item">
            <span className="size-label">24</span>
            <span className="size-sample size-24">Hamburgefonstiv</span>
          </div>
          <div className="size-scale-item">
            <span className="size-label">18</span>
            <span className="size-sample size-18">The quick brown fox jumps over the lazy dog</span>
          </div>
          <div className="size-scale-item">
            <span className="size-label">14</span>
            <span className="size-sample size-14">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</span>
          </div>
        </section>

        <div className="divider"></div>

        <section className="charset">
          <div className="section-title">Character Set</div>
          <div className="charset-display">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </div>
          <div className="charset-display charset-lower">
            abcdefghijklmnopqrstuvwxyz
          </div>
          <div className="charset-display charset-numbers">
            0123456789
          </div>
          <div className="charset-display charset-symbols">
            !@#$%^&*(){}[]|:;"'&lt;&gt;,.?/
          </div>
        </section>

        <div className="divider"></div>

        <section className="comparison">
          <div className="section-title">Variant Comparison</div>
          <div className="comparison-row">
            <span className="comparison-label">Square</span>
            <span className="comparison-sample square">The quick brown fox</span>
          </div>
          <div className="comparison-row">
            <span className="comparison-label">Grid</span>
            <span className="comparison-sample grid">The quick brown fox</span>
          </div>
          <div className="comparison-row">
            <span className="comparison-label">Circle</span>
            <span className="comparison-sample circle">The quick brown fox</span>
          </div>
          <div className="comparison-row">
            <span className="comparison-label">Triangle</span>
            <span className="comparison-sample triangle">The quick brown fox</span>
          </div>
          <div className="comparison-row">
            <span className="comparison-label">Line</span>
            <span className="comparison-sample line">The quick brown fox</span>
          </div>
        </section>

        <div className="divider"></div>

        <section>
          <div className="section-title">Sample Text</div>
          <div className="sample-block">
            <p className="sample-text">
              Geist Pixel is a bitmap-inspired typeface designed for digital interfaces.
              Each variant offers a unique pixel treatment while maintaining legibility.
              Built for banners, dashboards, and experimental layouts.
            </p>
          </div>
        </section>

        <footer>
          <div className="footer-left">
            Design Experiment / 2026
          </div>
          <div className="footer-right">
            <a href="https://vercel.com/font" target="_blank" rel="noopener">vercel.com/font</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
