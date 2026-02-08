'use client';

import { useState, useEffect } from 'react';
import './styles.css';

type FontPairing = {
  name: string;
  heading: string;
  body: string;
  classification: string;
};

export default function SpecSheet() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [showPairings, setShowPairings] = useState(false);
  const [currentPairing, setCurrentPairing] = useState<FontPairing>({
    name: 'Fraunces + Inter',
    heading: 'Fraunces',
    body: 'Inter',
    classification: 'Serif / Sans'
  });

  const pairings: FontPairing[] = [
    { name: 'Fraunces + Inter', heading: 'Fraunces', body: 'Inter', classification: 'Serif / Sans' },
    { name: 'DM Serif Display + Plus Jakarta Sans', heading: 'DM Serif Display', body: 'Plus Jakarta Sans', classification: 'Serif / Sans' },
    { name: 'Playfair Display + Source Sans 3', heading: 'Playfair Display', body: 'Source Sans 3', classification: 'Serif / Sans' },
    { name: 'Space Grotesk + Source Serif 4', heading: 'Space Grotesk', body: 'Source Serif 4', classification: 'Sans / Serif' },
    { name: 'Sora + Spectral', heading: 'Sora', body: 'Spectral', classification: 'Sans / Serif' },
    { name: 'Abril Fatface + Work Sans', heading: 'Abril Fatface', body: 'Work Sans', classification: 'Display / Sans' },
    { name: 'Bitter + Raleway', heading: 'Bitter', body: 'Raleway', classification: 'Slab Serif / Sans' },
    { name: 'Caprasimo + Roboto', heading: 'Caprasimo', body: 'Roboto', classification: 'Display / Sans' }
  ];

  const applyPairing = (pair: FontPairing) => {
    setCurrentPairing(pair);
    setShowPairings(false);
  };

  useEffect(() => {
    if (showPairings) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showPairings]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPairings(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className={isLightMode ? 'light-mode' : ''} style={{
      '--font-heading': `'${currentPairing.heading}', serif`,
      '--font-body': `'${currentPairing.body}', sans-serif`
    } as React.CSSProperties}>
      <div className="controls">
        <button className="control-btn" onClick={() => setIsLightMode(!isLightMode)}>
          <span className="mode-label">{isLightMode ? 'Dark' : 'Light'}</span>
        </button>
        <button className="control-btn" onClick={() => setShowPairings(true)}>
          Type Pairings
        </button>
      </div>

      <div className={`pairings-overlay ${showPairings ? 'open' : ''}`}>
        <div className="pairings-container">
          <div className="pairings-header">
            <div className="pairings-title">Type Pairings</div>
            <button className="close-btn" onClick={() => setShowPairings(false)}>Close</button>
          </div>
          <div className="pairings-grid">
            {pairings.map((pair, index) => (
              <button
                key={index}
                type="button"
                className="pairing-card"
                data-index={index}
                onClick={() => applyPairing(pair)}
              >
                <div className="pairing-specimen">
                  <div className="pairing-heading-sample" style={{ fontFamily: `'${pair.heading}', serif` }}>
                    Aa
                  </div>
                  <div className="pairing-alphabet" style={{ fontFamily: `'${pair.body}', sans-serif` }}>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    1234567890!?()[]{}&$#%
                  </div>
                </div>
                <div className="pairing-meta">
                  <div className="pairing-label">{pair.classification}</div>
                  <div className="pairing-names">{pair.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <header>
          <div className="masthead">
            <div className="logo">Type Specimen</div>
            <h1 className="tagline">The quick brown fox jumps over the lazy dog</h1>
          </div>
          <div className="meta-info">
            <div className="meta-row">
              <span>Classification</span>
              <span>{currentPairing.classification}</span>
            </div>
            <div className="meta-row">
              <span>Heading</span>
              <span>{currentPairing.heading}</span>
            </div>
            <div className="meta-row">
              <span>Body</span>
              <span>{currentPairing.body}</span>
            </div>
            <div className="meta-row">
              <span>Designed</span>
              <span>2020</span>
            </div>
          </div>
        </header>

        <section className="type-hero">
          <h1>Aa<span className="light">Bb</span><span className="italic">Cc</span></h1>
        </section>

        <section className="size-scale">
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

        <section className="charset">
          <div className="charset-title">Character Set</div>
          <div className="charset-display">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
            <span className="charset-lower">abcdefghijklmnopqrstuvwxyz</span>
          </div>
          <div className="charset-display charset-numbers">
            <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
          </div>
          <div className="charset-display charset-symbols">
            !@#$%^&*()&#123;&#125;[]|:;&quot;&apos;&lt;&gt;,.?/
          </div>
        </section>

        <div className="divider"></div>

        <section className="two-col">
          <div>
            <div className="section-label">Pull Quote</div>
            <blockquote className="pull-quote">
              <span className="drop-cap">W</span>e shall not cease from exploration, and the end of all our exploring will be to arrive where we started and know the place for the first time.
            </blockquote>
            <p className="attribution">T.S. Eliot, Four Quartets</p>
          </div>
          <div>
            <div className="section-label">Body Text</div>
            <div className="body-text">
              <p>Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.</p>
              <p>The term typography is also applied to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process. Type design is a closely related craft, sometimes considered part of typography; most typographers do not design typefaces.</p>
            </div>
          </div>
        </section>

        <div className="divider"></div>

        <section className="weight-ramp">
          <div className="weight-ramp-title">Weight Ramp</div>
          <div className="weight-grid">
            <div className="weight-item">
              <span className="weight-sample w-300">Sphinx</span>
              <span className="weight-name">Light 300</span>
            </div>
            <div className="weight-item">
              <span className="weight-sample w-400">Sphinx</span>
              <span className="weight-name">Regular 400</span>
            </div>
            <div className="weight-item">
              <span className="weight-sample w-500">Sphinx</span>
              <span className="weight-name">Medium 500</span>
            </div>
            <div className="weight-item">
              <span className="weight-sample w-600">Sphinx</span>
              <span className="weight-name">Semibold 600</span>
            </div>
            <div className="weight-item">
              <span className="weight-sample w-700">Sphinx</span>
              <span className="weight-name">Bold 700</span>
            </div>
            <div className="weight-item">
              <span className="weight-sample w-800">Sphinx</span>
              <span className="weight-name">Extrabold 800</span>
            </div>
          </div>
        </section>

        <footer>
          <div className="footer-left">
            Design Experiment / 2026
          </div>
          <div className="footer-right">
            {currentPairing.name}
          </div>
        </footer>
      </div>
    </div>
  );
}
