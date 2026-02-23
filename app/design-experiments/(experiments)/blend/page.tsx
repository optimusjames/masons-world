'use client';

import { useEffect, useRef, useState } from 'react';
import './styles.css';

export default function Blend() {
  const [showModal, setShowModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<{ id: string; name: string; colors: string[]; prompt: string } | null>(null);
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
    'g-04': {
      name: 'Ember',
      colors: ['#c97b63', '#4a1d34'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: warm copper (#c97b63)
- End color: dark burgundy (#4a1d34)
This creates a smoldering ember glow -- warm and intimate.`
    },
    'g-05': {
      name: 'Forest',
      colors: ['#065f46', '#0a0a0a'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: deep emerald (#065f46)
- End color: near-black (#0a0a0a)
This creates a dense canopy fading into shadow.`
    },
    'g-06': {
      name: 'Haze',
      colors: ['#8b7fc7', '#0c1222'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: dusty lavender (#8b7fc7)
- End color: deep midnight (#0c1222)
This creates a soft atmospheric haze.`
    },
    'g-07': {
      name: 'Ultraviolet',
      colors: ['#7c3aed', '#4f46e5'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: violet (#7c3aed)
- End color: indigo (#4f46e5)
This creates a saturated UV glow -- electric and concentrated.`
    },
    'g-08': {
      name: 'Oxidize',
      colors: ['#92400e', '#1c1917'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: burnt amber (#92400e)
- End color: warm charcoal (#1c1917)
This creates a weathered metal patina -- industrial and grounded.`
    },
    'g-09': {
      name: 'Ice',
      colors: ['#e0f2fe', '#0c4a6e'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: pale ice blue (#e0f2fe)
- End color: deep ocean (#0c4a6e)
This creates a glacial depth -- light surface, dark below. Text should be dark on the light end.`
    },
    'g-10': {
      name: 'Bruise',
      colors: ['#581c87', '#0f172a'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: deep purple (#581c87)
- End color: dark slate (#0f172a)
This creates a brooding, contused palette -- dramatic and moody.`
    },
    'm-01': {
      name: 'Mesh',
      colors: ['#14b8a6', '#6366f1', '#0c0c14'],
      prompt: `Create a card with a mesh gradient background using SVG blur:
- Background: near-black (#0c0c14)
- Blob 1: teal ellipse (#14b8a6) at left-center, 70% opacity
- Blob 2: indigo ellipse (#6366f1) at right-center, 60% opacity
- Apply a Gaussian blur (stdDeviation ~30) to both blobs
- Clip to card bounds
This creates an organic, ambient mesh gradient effect.`
    },
    'g-11': {
      name: 'Infrared',
      colors: ['#dc2626', '#450a0a'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: hot red (#dc2626)
- End color: blood dark (#450a0a)
This creates a thermal infrared signature -- urgent and alive.`
    },
    'g-12': {
      name: 'Void',
      colors: ['#18181b', '#09090b'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: zinc-900 (#18181b)
- End color: near-black (#09090b)
This creates an almost-black gradient with just enough depth to feel three-dimensional. Subtle.`
    },
    'g-13': {
      name: 'Verdigris',
      colors: ['#2dd4bf', '#134e4a'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: bright teal (#2dd4bf)
- End color: dark teal (#134e4a)
This creates a weathered copper patina -- aged and elegant.`
    },
    'g-14': {
      name: 'Rosewood',
      colors: ['#be185d', '#1a1a2e'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: deep rose (#be185d)
- End color: dark navy (#1a1a2e)
This creates a rich, saturated jewel tone fading into night.`
    },
    'g-15': {
      name: 'Aurora',
      colors: ['#34d399', '#6366f1', '#0f172a'],
      prompt: `Create a card with a linear gradient background:
- Angle: 160 degrees (steep diagonal)
- Color stop 1: emerald (#34d399) at 0%
- Color stop 2: indigo (#6366f1) at 50%
- Color stop 3: dark slate (#0f172a) at 100%
This creates a three-color aurora borealis sweep.`
    },
    'g-16': {
      name: 'Sulfur',
      colors: ['#facc15', '#422006'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: vivid yellow (#facc15)
- End color: dark umber (#422006)
This creates a volcanic sulfur glow -- bright surface decaying into scorched earth.`
    },
    'g-17': {
      name: 'Graphite',
      colors: ['#6b7280', '#111827'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: cool gray (#6b7280)
- End color: charcoal (#111827)
This creates a neutral graphite study -- professional and restrained.`
    },
    'g-18': {
      name: 'Plasma',
      colors: ['#e879f9', '#7c3aed', '#1e1b4b'],
      prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Color stop 1: fuchsia (#e879f9) at 0%
- Color stop 2: violet (#7c3aed) at 50%
- Color stop 3: deep indigo (#1e1b4b) at 100%
This creates a plasma discharge -- hot pink cooling through purple to dark.`
    },
    'm-02': {
      name: 'Solar Mesh',
      colors: ['#f97316', '#eab308', '#7c2d12'],
      prompt: `Create a card with a mesh gradient background using SVG blur:
- Background: dark brown (#1a0f0a)
- Blob 1: orange ellipse (#f97316) at center-left, 70% opacity
- Blob 2: amber ellipse (#eab308) at top-right, 50% opacity
- Blob 3: deep rust ellipse (#7c2d12) at bottom-center, 60% opacity
- Apply a Gaussian blur (stdDeviation ~35) to all blobs
This creates a solar corona effect -- molten and radiant.`
    },
    'm-03': {
      name: 'Deep Sea Mesh',
      colors: ['#0891b2', '#059669', '#312e81'],
      prompt: `Create a card with a mesh gradient background using SVG blur:
- Background: deep navy (#0a0a1a)
- Blob 1: cyan ellipse (#0891b2) at top-left, 65% opacity
- Blob 2: emerald ellipse (#059669) at bottom-right, 55% opacity
- Blob 3: indigo ellipse (#312e81) at center, 50% opacity
- Apply a Gaussian blur (stdDeviation ~40) to all blobs
This creates a bioluminescent deep-sea atmosphere.`
    },
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
          <div className="card blob-card span-2x1" onClick={() => showRecipe('m-01')}>
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
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </div>
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

          <div className="card gradient-card g-04" onClick={() => showRecipe('g-04')}>
            <span className="card-label">Ember</span>
            <span className="card-id">G-04</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-05" onClick={() => showRecipe('g-05')}>
            <span className="card-label">Forest</span>
            <span className="card-id">G-05</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-06" onClick={() => showRecipe('g-06')}>
            <span className="card-label">Haze</span>
            <span className="card-id">G-06</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-07" onClick={() => showRecipe('g-07')}>
            <span className="card-label">Ultraviolet</span>
            <span className="card-id">G-07</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          {/* Solar Mesh */}
          <div className="card blob-card span-2x1" onClick={() => showRecipe('m-02')}>
            <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="35"/>
                </filter>
              </defs>
              <rect fill="#1a0f0a" width="100%" height="100%"/>
              <g filter="url(#blur2)" className="blob-group">
                <ellipse cx="120" cy="110" rx="90" ry="70" fill="#f97316" opacity="0.7"/>
                <ellipse cx="300" cy="60" rx="70" ry="60" fill="#eab308" opacity="0.5"/>
                <ellipse cx="200" cy="170" rx="80" ry="60" fill="#7c2d12" opacity="0.6"/>
              </g>
            </svg>
            <span className="card-label">Solar Mesh</span>
            <span className="card-id">M-02</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-08" onClick={() => showRecipe('g-08')}>
            <span className="card-label">Oxidize</span>
            <span className="card-id">G-08</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-09" onClick={() => showRecipe('g-09')}>
            <span className="card-label">Ice</span>
            <span className="card-id">G-09</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-10" onClick={() => showRecipe('g-10')}>
            <span className="card-label">Bruise</span>
            <span className="card-id">G-10</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-11" onClick={() => showRecipe('g-11')}>
            <span className="card-label">Infrared</span>
            <span className="card-id">G-11</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-12" onClick={() => showRecipe('g-12')}>
            <span className="card-label">Void</span>
            <span className="card-id">G-12</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-13" onClick={() => showRecipe('g-13')}>
            <span className="card-label">Verdigris</span>
            <span className="card-id">G-13</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-14" onClick={() => showRecipe('g-14')}>
            <span className="card-label">Rosewood</span>
            <span className="card-id">G-14</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          {/* Deep Sea Mesh */}
          <div className="card blob-card span-2x1" onClick={() => showRecipe('m-03')}>
            <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="40"/>
                </filter>
              </defs>
              <rect fill="#0a0a1a" width="100%" height="100%"/>
              <g filter="url(#blur3)" className="blob-group">
                <ellipse cx="80" cy="60" rx="100" ry="80" fill="#0891b2" opacity="0.65"/>
                <ellipse cx="320" cy="150" rx="90" ry="70" fill="#059669" opacity="0.55"/>
                <ellipse cx="200" cy="100" rx="70" ry="90" fill="#312e81" opacity="0.5"/>
              </g>
            </svg>
            <span className="card-label">Deep Sea Mesh</span>
            <span className="card-id">M-03</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-15" onClick={() => showRecipe('g-15')}>
            <span className="card-label">Aurora</span>
            <span className="card-id">G-15</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-16" onClick={() => showRecipe('g-16')}>
            <span className="card-label">Sulfur</span>
            <span className="card-id">G-16</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-17" onClick={() => showRecipe('g-17')}>
            <span className="card-label">Graphite</span>
            <span className="card-id">G-17</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>

          <div className="card gradient-card g-18" onClick={() => showRecipe('g-18')}>
            <span className="card-label">Plasma</span>
            <span className="card-id">G-18</span>
            <div className="recipe-icon">
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
          </div>
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
