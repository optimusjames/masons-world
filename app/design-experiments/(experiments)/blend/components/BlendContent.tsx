'use client';

import { useEffect, useRef, useState } from 'react';
import { recipes } from '../data/recipes';
import { RecipeModal } from './RecipeModal';
import s from '../styles.module.css';

const c = (classes: string) => classes.split(' ').map(n => s[n]).filter(Boolean).join(' ');

export function BlendContent() {
  const [showModal, setShowModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<{ id: string; name: string; colors: string[]; prompt: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    let visibleCount = 0;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains(s.visible)) {
          const delay = Math.min(visibleCount % 5, 5);
          entry.target.setAttribute('data-delay', String(delay));

          requestAnimationFrame(() => {
            entry.target.classList.add(s.visible);
          });

          visibleCount++;
        }
      });
    }, observerOptions);

    // Defer observer setup to after hydration completes,
    // otherwise DOM nodes may be reconciled and lose the visible class
    const frameId = requestAnimationFrame(() => {
      document.querySelectorAll(`.${s.card}`).forEach(card => {
        observerRef.current?.observe(card);
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      observerRef.current?.disconnect();
    };
  }, []);

  const showRecipe = (recipeId: string) => {
    const recipe = recipes[recipeId as keyof typeof recipes];
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
      } catch {
        // clipboard write failed silently
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
      <main className={c('container')}>
        <div className={c('grid')}>
          {/* Title Card */}
          <div className={c('card title-card span-2x2')}>
            <span className={c('card-label')}>System</span>
            <h1>Blend</h1>
            <p>A systematic collection of gradient specimens designed for modern interfaces. Each gradient is calibrated for optimal contrast and visual harmony.</p>
          </div>

          {/* Gradient Cards */}
          <div className={c('card gradient-card g-01')} onClick={() => showRecipe('g-01')}>
            <span className={c('card-label')}>Depth</span>
            <span className={c('card-id')}>G-01</span>
            <div className={c('recipe-icon')}>
              <svg viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
          </div>

          <div className={c('card gradient-card g-02')} onClick={() => showRecipe('g-02')}>
            <span className={c('card-label')}>Dusk</span>
            <span className={c('card-id')}>G-02</span>
            <div className={c('recipe-icon')}>
              <svg viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
          </div>

          {/* SVG Blob Mesh */}
          <div className={c('card blob-card span-2x1')} onClick={() => showRecipe('m-01')}>
            <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="35"/>
                </filter>
              </defs>
              <rect fill="#0c0c14" width="100%" height="100%"/>
              <g filter="url(#blur1)" className={c('blob-group')}>
                <ellipse cx="80" cy="80" rx="160" ry="120" fill="#14b8a6" opacity="0.75"/>
                <ellipse cx="320" cy="130" rx="150" ry="130" fill="#6366f1" opacity="0.7"/>
              </g>
            </svg>
            <span className={c('card-label')}>Mesh</span>
            <span className={c('card-id')}>M-01</span>
            <div className={c('recipe-icon')}>
              <svg viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
          </div>

          {/* Text Layout Card */}
          <div className={c('card text-card span-1x2')}>
            <span className={c('card-label')}>Layout</span>
            <h3>Typography on gradient</h3>
            <p>Gradients provide rich visual context while maintaining text legibility through careful contrast management.</p>
            <span className={c('card-id')}>L-01</span>
          </div>

          <div className={c('card gradient-card g-03')} onClick={() => showRecipe('g-03')}>
            <span className={c('card-label')}>Signal</span>
            <span className={c('card-id')}>G-03</span>
            <div className={c('recipe-icon')}>
              <svg viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
          </div>

          {/* Analytics Chart Card */}
          <div className={c('card chart-card span-2x1')}>
            <div className={c('chart-metrics')}>
              <div className={c('metric')}>
                <span className={c('metric-label')}>Revenue</span>
                <span className={c('metric-value')}>$12,450</span>
                <span className={c('metric-change')}>+12.5%</span>
              </div>
              <div className={c('metric')}>
                <span className={c('metric-label')}>Users</span>
                <span className={c('metric-value')}>2,847</span>
                <span className={c('metric-change')}>+8.2%</span>
              </div>
            </div>
            <div className={c('chart-area')}>
              <svg className={c('chart-svg')} viewBox="0 0 300 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line className={c('chart-grid-line')} x1="60" y1="0" x2="60" y2="120"/>
                <line className={c('chart-grid-line')} x1="120" y1="0" x2="120" y2="120"/>
                <line className={c('chart-grid-line')} x1="180" y1="0" x2="180" y2="120"/>
                <line className={c('chart-grid-line')} x1="240" y1="0" x2="240" y2="120"/>
                <path
                  className={c('chart-area-fill')}
                  d="M0,90 L50,75 L100,82 L150,55 L200,62 L250,40 L300,30 L300,120 L0,120 Z"
                  fill="url(#areaGradient)"
                />
                <polyline
                  className={c('chart-line-animated')}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,90 50,75 100,82 150,55 200,62 250,40 300,30"
                />
              </svg>
            </div>
            <span className={c('card-id')}>C-01</span>
          </div>

          <div className={c('card gradient-card g-04')} onClick={() => showRecipe('g-04')}>
            <span className={c('card-label')}>Ember</span>
            <span className={c('card-id')}>G-04</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-05')} onClick={() => showRecipe('g-05')}>
            <span className={c('card-label')}>Forest</span>
            <span className={c('card-id')}>G-05</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-06')} onClick={() => showRecipe('g-06')}>
            <span className={c('card-label')}>Haze</span>
            <span className={c('card-id')}>G-06</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-07')} onClick={() => showRecipe('g-07')}>
            <span className={c('card-label')}>Ultraviolet</span>
            <span className={c('card-id')}>G-07</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          {/* Solar Mesh */}
          <div className={c('card blob-card span-2x1')} onClick={() => showRecipe('m-02')}>
            <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="38"/>
                </filter>
              </defs>
              <rect fill="#1a0f0a" width="100%" height="100%"/>
              <g filter="url(#blur2)" className={c('blob-group')}>
                <ellipse cx="80" cy="120" rx="160" ry="130" fill="#f97316" opacity="0.75"/>
                <ellipse cx="320" cy="50" rx="140" ry="110" fill="#eab308" opacity="0.6"/>
                <ellipse cx="200" cy="180" rx="130" ry="100" fill="#7c2d12" opacity="0.65"/>
              </g>
            </svg>
            <span className={c('card-label')}>Solar Mesh</span>
            <span className={c('card-id')}>M-02</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-08')} onClick={() => showRecipe('g-08')}>
            <span className={c('card-label')}>Oxidize</span>
            <span className={c('card-id')}>G-08</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-09')} onClick={() => showRecipe('g-09')}>
            <span className={c('card-label')}>Ice</span>
            <span className={c('card-id')}>G-09</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-10')} onClick={() => showRecipe('g-10')}>
            <span className={c('card-label')}>Bruise</span>
            <span className={c('card-id')}>G-10</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-11')} onClick={() => showRecipe('g-11')}>
            <span className={c('card-label')}>Infrared</span>
            <span className={c('card-id')}>G-11</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-12')} onClick={() => showRecipe('g-12')}>
            <span className={c('card-label')}>Void</span>
            <span className={c('card-id')}>G-12</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-13')} onClick={() => showRecipe('g-13')}>
            <span className={c('card-label')}>Verdigris</span>
            <span className={c('card-id')}>G-13</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-14')} onClick={() => showRecipe('g-14')}>
            <span className={c('card-label')}>Rosewood</span>
            <span className={c('card-id')}>G-14</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          {/* Deep Sea Mesh */}
          <div className={c('card blob-card span-2x1')} onClick={() => showRecipe('m-03')}>
            <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="40"/>
                </filter>
              </defs>
              <rect fill="#0a0a1a" width="100%" height="100%"/>
              <g filter="url(#blur3)" className={c('blob-group')}>
                <ellipse cx="60" cy="60" rx="160" ry="120" fill="#0891b2" opacity="0.7"/>
                <ellipse cx="340" cy="150" rx="150" ry="120" fill="#059669" opacity="0.65"/>
                <ellipse cx="200" cy="100" rx="120" ry="130" fill="#312e81" opacity="0.6"/>
              </g>
            </svg>
            <span className={c('card-label')}>Deep Sea Mesh</span>
            <span className={c('card-id')}>M-03</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-15')} onClick={() => showRecipe('g-15')}>
            <span className={c('card-label')}>Aurora</span>
            <span className={c('card-id')}>G-15</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-16')} onClick={() => showRecipe('g-16')}>
            <span className={c('card-label')}>Sulfur</span>
            <span className={c('card-id')}>G-16</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-17')} onClick={() => showRecipe('g-17')}>
            <span className={c('card-label')}>Graphite</span>
            <span className={c('card-id')}>G-17</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>

          <div className={c('card gradient-card g-18')} onClick={() => showRecipe('g-18')}>
            <span className={c('card-label')}>Plasma</span>
            <span className={c('card-id')}>G-18</span>
            <div className={c('recipe-icon')}><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></div>
          </div>
        </div>
      </main>

      {showModal && currentRecipe && (
        <RecipeModal
          recipe={currentRecipe}
          copySuccess={copySuccess}
          onClose={hideModal}
          onCopy={copyPrompt}
        />
      )}
    </>
  );
}
