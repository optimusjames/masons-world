'use client';

import { useEffect, useRef, useState } from 'react';
import './styles.css';

export default function Blend() {
  const [showModal, setShowModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const recipes = {
    'g-01': {
      name: 'Depth',
      colors: ['#0d4f4f', '#1a2744'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: dark teal (#0d4f4f)
- End color: deep navy (#1a2744)
This creates a moody, oceanic depth effect.`
    },
    'g-02': {
      name: 'Dusk',
      colors: ['#3d2d5c', '#0f1729'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: muted purple (#3d2d5c)
- End color: dark navy (#0f1729)
This creates a twilight dusk atmosphere.`
    },
    'g-03': {
      name: 'Signal',
      colors: ['#14b8a6', '#6366f1'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: teal (#14b8a6)
- End color: indigo (#6366f1)
This creates a vibrant, energetic signal effect.`
    },
    // Add remaining recipes as needed for production
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    let visibleCount = 0;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
          const delay = Math.min(visibleCount % 5, 5);
          entry.target.setAttribute('data-delay', String(delay));

          requestAnimationFrame(() => {
            entry.target.classList.add('visible');
          });

          visibleCount++;
        }
      });
    }, observerOptions);

    document.querySelectorAll('.card').forEach(card => {
      observerRef.current?.observe(card);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const showRecipe = (recipeId: string) => {
    const recipe = (recipes as any)[recipeId];
    if (recipe) {
      setCurrentRecipe({ id: recipeId, ...recipe });
      setShowModal(true);
      setCopySuccess(false);
    }
  };

  const hideModal = () => {
    setShowModal(false);
    setCopySuccess(false);
  };

  const copyPrompt = async () => {
    if (currentRecipe) {
      try {
        await navigator.clipboard.writeText(currentRecipe.prompt);
        setCopySuccess(true);
        setTimeout(hideModal, 1500);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideModal();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <header className="header">
        <div className="wordmark">Blend</div>
        <div className="specimen-label">Gradient Specimen 01</div>
      </header>

      <main className="container">
        <div className="grid">
          {/* Title Card */}
          <div className="card title-card span-2x2">
            <span className="card-label">System</span>
            <h1>Blend</h1>
            <p>A systematic collection of gradient specimens designed for modern interfaces. Each gradient is calibrated for optimal contrast and visual harmony.</p>
          </div>

          {/* Gradient Cards */}
          <div className="card gradient-card g-01" onClick={() => showRecipe('g-01')}>
            <span className="card-label">Depth</span>
            <span className="card-id">G-01</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
          </div>

          <div className="card gradient-card g-02" onClick={() => showRecipe('g-02')}>
            <span className="card-label">Dusk</span>
            <span className="card-id">G-02</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
          </div>

          {/* SVG Blob Mesh */}
          <div className="card blob-card span-2x1">
            <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="30"/>
                </filter>
              </defs>
              <rect fill="#0c0c14" width="100%" height="100%"/>
              <g filter="url(#blur1)" className="blob-group">
                <ellipse cx="100" cy="100" rx="100" ry="80" fill="#14b8a6" opacity="0.7"/>
                <ellipse cx="300" cy="120" rx="80" ry="100" fill="#6366f1" opacity="0.6"/>
              </g>
            </svg>
            <span className="card-label">Mesh</span>
            <span className="card-id">M-01</span>
          </div>

          {/* Text Layout Card */}
          <div className="card text-card span-1x2">
            <span className="card-label">Layout</span>
            <h3>Typography on gradient</h3>
            <p>Gradients provide rich visual context while maintaining text legibility through careful contrast management.</p>
            <span className="card-id">L-01</span>
          </div>

          <div className="card gradient-card g-03" onClick={() => showRecipe('g-03')}>
            <span className="card-label">Signal</span>
            <span className="card-id">G-03</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
          </div>

          {/* Analytics Chart Card */}
          <div className="card chart-card span-2x1">
            <div className="chart-metrics">
              <div className="metric">
                <span className="metric-label">Revenue</span>
                <span className="metric-value">$12,450</span>
                <span className="metric-change">+12.5%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Users</span>
                <span className="metric-value">2,847</span>
                <span className="metric-change">+8.2%</span>
              </div>
            </div>
            <div className="chart-area">
              <svg className="chart-svg" viewBox="0 0 300 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line className="chart-grid-line" x1="60" y1="0" x2="60" y2="120"/>
                <line className="chart-grid-line" x1="120" y1="0" x2="120" y2="120"/>
                <line className="chart-grid-line" x1="180" y1="0" x2="180" y2="120"/>
                <line className="chart-grid-line" x1="240" y1="0" x2="240" y2="120"/>
                <path
                  className="chart-area-fill"
                  d="M0,90 L50,75 L100,82 L150,55 L200,62 L250,40 L300,30 L300,120 L0,120 Z"
                  fill="url(#areaGradient)"
                />
                <polyline
                  className="chart-line-animated"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,90 50,75 100,82 150,55 200,62 250,40 300,30"
                />
              </svg>
            </div>
            <span className="card-id">C-01</span>
          </div>

          {/* More cards would go here - abbreviated for brevity */}
        </div>
      </main>

      {/* Recipe Modal */}
      {showModal && (
        <>
          <div className={`recipe-overlay ${showModal ? 'visible' : ''}`} onClick={hideModal} />
          <div className={`recipe-modal ${showModal ? 'visible' : ''}`}>
            <div className="recipe-modal-header">
              {currentRecipe?.name} · {currentRecipe?.id.toUpperCase()}
            </div>
            <div className="recipe-modal-swatches">
              {currentRecipe?.colors.map((color: string, i: number) => (
                <div key={i} className="recipe-swatch" style={{ background: color }} />
              ))}
            </div>
            <div className="recipe-modal-prompt">
              {currentRecipe?.prompt}
            </div>
            <div className="recipe-modal-footer">
              <button
                className={`recipe-copy-btn ${copySuccess ? 'copied' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  copyPrompt();
                }}
              >
                {copySuccess ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
