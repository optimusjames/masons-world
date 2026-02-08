'use client';

import { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import chroma from 'chroma-js';

// Context for Card component
const CardContext = createContext();

// Color scale data
const stoneScale = {
    50: '#f7f8f8',
    100: '#e8eaea',
    200: '#d1d5d5',
    300: '#b0b6b6',
    400: '#909999',
    500: '#707d7d',
    600: '#5a6565',
    700: '#454e4e',
    800: '#323939',
    900: '#1f2525',
    950: '#0f1313',
};

const greenScale = {
    50: '#f0fdf4',
    100: '#d1f4e0',
    200: '#9de9c5',
    300: '#5dd9a8',
    400: '#0bd684',
    500: '#00b86d',
    600: '#009657',
    700: '#007a47',
    800: '#005f38',
    900: '#003d24',
    950: '#001f12',
};

const emberScale = {
    50: '#fff5f7',
    100: '#ffe4e9',
    200: '#ffc9d4',
    300: '#ff9db0',
    400: '#ff7e95',
    500: '#FF5E7E',
    600: '#e6446a',
    700: '#c72f56',
    800: '#a01f42',
    900: '#6b1530',
    950: '#3d0a1b',
};

const blueScale = {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
};

const colorScales = {
    stone: stoneScale,
    green: greenScale,
    ember: emberScale,
    blue: blueScale,
    primary: greenScale,
    secondary: emberScale,
    neutral: stoneScale,
    accent: blueScale,
};

// Font pairings data
const fontPairings = [
    {
        name: 'Space Grotesk',
        heading: 'Space Grotesk',
        body: 'Space Grotesk',
        classification: 'Geometric Sans',
        description: 'Space Grotesk serves as the primary typeface across all brand communications. Its geometric construction and open letterforms provide excellent readability while maintaining a contemporary, technical aesthetic. Use Regular for body text, Medium for subheadings, and Bold for headlines.'
    },
    {
        name: 'Fraunces + Inter',
        heading: 'Fraunces',
        body: 'Inter',
        classification: 'Serif / Sans',
        description: 'Fraunces brings old-style warmth with its soft, wonky serifs and optical sizing, while Inter provides the clarity needed for interface text. This pairing balances editorial elegance with digital practicality—perfect for brands that want personality without sacrificing usability.'
    },
    {
        name: 'DM Serif Display + Plus Jakarta Sans',
        heading: 'DM Serif Display',
        body: 'Plus Jakarta Sans',
        classification: 'Serif / Sans',
        description: 'DM Serif Display offers refined, high-contrast letterforms ideal for impactful headlines, while Plus Jakarta Sans delivers friendly geometric shapes for comfortable reading. Together they create a sophisticated yet approachable voice.'
    },
    {
        name: 'Playfair Display + Source Sans 3',
        heading: 'Playfair Display',
        body: 'Source Sans 3',
        classification: 'Serif / Sans',
        description: 'Playfair Display channels 18th-century transitional design with dramatic thick-thin contrast, paired with the neutral efficiency of Source Sans 3. This combination suits editorial and luxury contexts where classic elegance meets modern clarity.'
    },
    {
        name: 'Space Grotesk + Source Serif 4',
        heading: 'Space Grotesk',
        body: 'Source Serif 4',
        classification: 'Sans / Serif',
        description: 'An unconventional pairing that leads with geometric sans-serif headlines and settles into traditional serif body text. Space Grotesk commands attention while Source Serif 4 provides the reading comfort expected in long-form content.'
    },
    {
        name: 'Sora + Spectral',
        heading: 'Sora',
        body: 'Spectral',
        classification: 'Sans / Serif',
        description: 'Sora brings geometric precision with subtle personality through its rounded terminals, while Spectral—designed specifically for screen reading—delivers exceptional clarity at small sizes. A modern pairing optimized for digital-first experiences.'
    },
    {
        name: 'Abril Fatface + Work Sans',
        heading: 'Abril Fatface',
        body: 'Work Sans',
        classification: 'Display / Sans',
        description: 'Abril Fatface makes a bold statement with its heavy Didone-inspired letterforms, demanding attention for headlines and titles. Work Sans grounds the design with friendly, straightforward text that never competes. Best for designs that need drama up top and calm below.'
    },
    {
        name: 'Bitter + Raleway',
        heading: 'Bitter',
        body: 'Raleway',
        classification: 'Slab Serif / Sans',
        description: 'Bitter brings sturdy slab-serif character designed specifically for screen comfort, while Raleway adds elegance through its thin, extended letterforms. This pairing works well for content-heavy sites that need warmth without heaviness.'
    },
    {
        name: 'Caprasimo + Roboto',
        heading: 'Caprasimo',
        body: 'Roboto',
        classification: 'Display / Sans',
        description: 'Caprasimo delivers playful, chunky display lettering with strong personality, balanced by Roboto\'s mechanical precision and neutral tone. Use this pairing when you want headlines that pop against dependably readable body text.'
    }
];

// Sensible defaults
const defaults = {
    bg: '900',
    label: '300',
    title: 'white',
    body: 'white',
    buttonBg: '700',
    buttonBorder: '600',
    buttonText: '200',
};

// Helper: Generate color scale from base color using Chroma.js
function generateScale(baseColor) {
    try {
        const lightScale = chroma.scale([
            chroma(baseColor).brighten(3.5),
            baseColor
        ])
        .mode('lch')
        .correctLightness()
        .colors(10);

        const color950 = chroma(baseColor).darken(0.8).hex();

        const values = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        const scale = {};
        values.forEach((value, index) => {
            scale[value] = lightScale[index];
        });
        scale[950] = color950;

        return scale;
    } catch (error) {
        console.error('Error generating scale:', error);
        return null;
    }
}

// Helper: Update CSS variables from scales object
function updateCSSVariables(scales) {
    const root = document.documentElement;
    const colorNameMap = {
        primary: 'green',
        secondary: 'ember',
        accent: 'blue',
        neutral: 'stone'
    };

    Object.entries(scales).forEach(([scaleName, scaleObj]) => {
        Object.entries(scaleObj).forEach(([value, color]) => {
            root.style.setProperty(`--${scaleName}-${value}`, color);
            const colorName = colorNameMap[scaleName];
            if (colorName) {
                root.style.setProperty(`--${colorName}-${value}`, color);
            }
        });
    });
}

// Card component
function Card({ colorScale = 'neutral', bg, children }) {
    const bgValue = bg || defaults.bg;
    const backgroundColor = `var(--${colorScale}-${bgValue})`;

    return (
        <CardContext.Provider value={colorScale}>
            <div className="card" style={{ backgroundColor }}>
                {children}
            </div>
        </CardContext.Provider>
    );
}

// CardLabel component
function CardLabel({ children, color }) {
    const colorScale = useContext(CardContext);
    const colorValue = color || defaults.label;
    const textColor = `var(--${colorScale}-${colorValue})`;

    return (
        <div className="card-label" style={{ color: textColor }}>
            {children}
        </div>
    );
}

// CardTitle component
function CardTitle({ children }) {
    return (
        <h3 className="card-title">
            {children}
        </h3>
    );
}

// CardBody component
function CardBody({ children }) {
    return (
        <p className="card-body">
            {children}
        </p>
    );
}

// CardButton component
function CardButton({ children, bg, border, textColor }) {
    const colorScale = useContext(CardContext);
    const bgValue = bg || defaults.buttonBg;
    const borderValue = border || defaults.buttonBorder;
    const textValue = textColor || defaults.buttonText;

    return (
        <a
            href="#"
            className="card-button"
            style={{
                backgroundColor: `var(--${colorScale}-${bgValue})`,
                borderColor: `var(--${colorScale}-${borderValue})`,
                color: `var(--${colorScale}-${textValue})`,
            }}
        >
            {children}
        </a>
    );
}

// AnalyticsWidget component
function AnalyticsWidget({ colorScale = 'secondary', chartColor = 'secondary' }) {
    const dayLabels = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const [loadKey, setLoadKey] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const getRandomValues = useCallback(() => ({
        total: Math.floor(Math.random() * 5000) + 3000,
        bars: dayLabels.map(() => Math.floor(Math.random() * 60) + 20)
    }), []);

    const [values, setValues] = useState(getRandomValues);

    const handleReload = () => {
        setIsLoaded(false);
        setValues(getRandomValues());
        setLoadKey(k => k + 1);
        setTimeout(() => setIsLoaded(true), 50);
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, [loadKey]);

    const formatTotal = (num) => {
        if (num >= 1000) {
            return `${Math.round(num / 1000)}K+`;
        }
        return num.toString();
    };

    const textColor = `var(--${colorScale}-200)`;
    const barColor = `var(--${chartColor}-400)`;

    return (
        <div
            key={loadKey}
            className="analytics-widget"
            onClick={handleReload}
        >
            <div
                className={`analytics-header ${isLoaded ? 'loaded' : ''}`}
                style={{ color: textColor }}
            >
                <span className="analytics-header-label">ANALYTICS</span>
                <span className="analytics-header-badge">This Week</span>
            </div>

            <div
                className={`analytics-number ${isLoaded ? 'loaded' : ''}`}
                style={{ color: textColor }}
            >
                {formatTotal(values.total)}
            </div>

            <div className="analytics-bars">
                {values.bars.map((height, i) => (
                    <div className="analytics-bar-column" key={i}>
                        <div className="analytics-bar-container">
                            <div
                                className={`analytics-bar ${isLoaded ? 'loaded' : ''}`}
                                style={{
                                    '--bar-height': `${height}%`,
                                    background: `linear-gradient(to top, ${barColor} 50%, rgba(255,255,255,0.15) 50%)`,
                                    transitionDelay: `${0.2 + i * 0.05}s`
                                }}
                            />
                        </div>
                        <span
                            className={`analytics-bar-label ${isLoaded ? 'loaded' : ''}`}
                            style={{
                                color: textColor,
                                transitionDelay: `${0.3 + i * 0.05}s`
                            }}
                        >
                            {dayLabels[i]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ActivityChartWidget component
function ActivityChartWidget({ colorScale = 'primary', chartColor = 'primary' }) {
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const svgRef = useRef(null);
    const [loadKey, setLoadKey] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [pathLength, setPathLength] = useState(400);

    const getRandomValues = useCallback(() => ({
        avg: Math.floor(Math.random() * 60) + 30,
        points: dayLabels.map(() => Math.floor(Math.random() * 60) + 20)
    }), []);

    const [values, setValues] = useState(getRandomValues);

    const handleReload = () => {
        setIsLoaded(false);
        setValues(getRandomValues());
        setLoadKey(k => k + 1);
        setTimeout(() => setIsLoaded(true), 50);
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, [loadKey]);

    useEffect(() => {
        if (!svgRef.current || !isLoaded) return;
        const path = svgRef.current.querySelector('.activity-line-path');
        if (path) {
            setPathLength(path.getTotalLength());
        }
    }, [values, isLoaded]);

    const width = 100;
    const height = 40;
    const padding = { top: 6, right: 2, bottom: 2, left: 2 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = values.points.map((value, index) => ({
        x: padding.left + (index / (values.points.length - 1)) * chartWidth,
        y: padding.top + chartHeight - ((value - 20) / 60) * chartHeight
    }));

    const generateSmoothPath = (pts) => {
        if (pts.length < 2) return '';
        const tension = 0.3;
        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(pts.length - 1, i + 2)];
            const cp1x = p1.x + (p2.x - p0.x) * tension;
            const cp1y = p1.y + (p2.y - p0.y) * tension;
            const cp2x = p2.x - (p3.x - p1.x) * tension;
            const cp2y = p2.y - (p3.y - p1.y) * tension;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return path;
    };

    const generateAreaPath = (pts) => {
        const curvePath = generateSmoothPath(pts);
        return `${curvePath} L ${pts[pts.length - 1].x} ${padding.top + chartHeight} L ${pts[0].x} ${padding.top + chartHeight} Z`;
    };

    const linePath = generateSmoothPath(points);
    const areaPath = generateAreaPath(points);

    const lineColor = `var(--${chartColor}-400)`;
    const textColor = `var(--${colorScale}-200)`;
    const badgeBg = `var(--${chartColor}-400)`;
    const badgeText = `var(--${chartColor}-950)`;

    return (
        <div
            key={loadKey}
            className="activity-widget"
            onClick={handleReload}
        >
            <div
                className={`activity-header ${isLoaded ? 'loaded' : ''}`}
            >
                <span className="activity-header-label" style={{ color: '#ffffff' }}>ACTIVITY</span>
                <span
                    className="activity-header-badge"
                    style={{ background: badgeBg, color: badgeText }}
                >
                    This Week
                </span>
            </div>

            <div className={`activity-number ${isLoaded ? 'loaded' : ''}`}>
                <span className="activity-number-value" style={{ color: '#ffffff' }}>
                    {values.avg}
                </span>
                <span className="activity-number-suffix" style={{ color: textColor }}>
                    avg
                </span>
            </div>

            <div className="activity-chart-container">
                <svg
                    ref={svgRef}
                    className="activity-chart-svg"
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                    style={{ '--path-length': `${pathLength}px` }}
                >
                    <defs>
                        <linearGradient id={`activityArea-${loadKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={lineColor} stopOpacity="0.6" />
                            <stop offset="100%" stopColor={lineColor} stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <path
                        className={`activity-area-path ${isLoaded ? 'loaded' : ''}`}
                        d={areaPath}
                        fill={`url(#activityArea-${loadKey})`}
                    />
                    <path
                        className={`activity-line-path ${isLoaded ? 'loaded' : ''}`}
                        d={linePath}
                        stroke={lineColor}
                    />
                </svg>
                {points.map((pt, index) => {
                    const xPercent = (pt.x / width) * 100;
                    const yPercent = (pt.y / height) * 100;
                    return (
                        <div
                            key={index}
                            className={`activity-dot ${isLoaded ? 'loaded' : ''}`}
                            style={{
                                left: `${xPercent}%`,
                                top: `${yPercent}%`,
                                background: lineColor,
                                animationDelay: `${0.4 + index * 0.08}s`
                            }}
                        />
                    );
                })}
            </div>

            <div className={`activity-day-labels ${isLoaded ? 'loaded' : ''}`} style={{ color: textColor }}>
                {dayLabels.map((day, i) => (
                    <span key={i} className="activity-day-label">{day}</span>
                ))}
            </div>
        </div>
    );
}

// ColorSidebar component
function ColorSidebar({
    isOpen,
    currentScales,
    backgroundColor,
    currentPairing,
    onColorChange,
    onBackgroundChange,
    onPairingChange,
    onResetAll,
    onClose
}) {
    const [showExport, setShowExport] = useState(false);
    const [exportText, setExportText] = useState('');

    const colorNames = {
        primary: 'Primary',
        secondary: 'Secondary',
        accent: 'Accent',
        neutral: 'Neutral'
    };

    const handleColorChange = (scaleName, newBaseColor) => {
        const newScale = generateScale(newBaseColor);
        if (newScale) {
            onColorChange(scaleName, newScale);
        }
    };

    const handleResetAll = () => {
        if (window.confirm('Reset all settings to defaults?')) {
            onResetAll();
        }
    };

    const handleExport = () => {
        const spec = `Design System Specification

Background: ${backgroundColor}

Typography:
- Heading Font: ${currentPairing.heading}
- Body Font: ${currentPairing.body}
- Classification: ${currentPairing.classification}
- Context: ${currentPairing.description}

Color Scales:
${Object.entries(colorNames).map(([key, name]) => `
${name}:
- Base (900): ${currentScales[key][900]}
- Mid (500): ${currentScales[key][500]}
- Light (100): ${currentScales[key][100]}
- Full range: 50=${currentScales[key][50]}, 100=${currentScales[key][100]}, 200=${currentScales[key][200]}, 300=${currentScales[key][300]}, 400=${currentScales[key][400]}, 500=${currentScales[key][500]}, 600=${currentScales[key][600]}, 700=${currentScales[key][700]}, 800=${currentScales[key][800]}, 900=${currentScales[key][900]}, 950=${currentScales[key][950]}`).join('\n')}

Implementation Notes:
- Colors generated using perceptually uniform scales (Chroma.js)
- Suitable for both light and dark themes
- Font pairing optimized for digital readability
- Use these as semantic guidelines - implement with your preferred method (CSS custom properties, Tailwind, styled-components, etc.)`;

        setExportText(spec);
        setShowExport(true);
    };

    const handleCopyExport = () => {
        navigator.clipboard.writeText(exportText);
        alert('Copied to clipboard! Share this with your AI agent.');
    };

    return (
        <>
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2>Customize</h2>
                <button className="sidebar-close" onClick={onClose}>&times;</button>
            </div>
            <div className="sidebar-body">
                <div className="sidebar-section">
                    <div className="sidebar-section-label">Colors</div>
                    {Object.entries(colorNames).map(([scaleName, displayName]) => (
                        <div className="sidebar-color-row" key={scaleName}>
                            <input
                                type="color"
                                className="sidebar-color-input"
                                value={currentScales[scaleName][900]}
                                onChange={(e) => handleColorChange(scaleName, e.target.value)}
                            />
                            <div className="sidebar-color-info">
                                <div className="sidebar-color-name">{displayName}</div>
                                <div className="sidebar-color-hex">{currentScales[scaleName][900].toUpperCase()}</div>
                            </div>
                        </div>
                    ))}
                    <div className="sidebar-color-row">
                        <input
                            type="color"
                            className="sidebar-color-input"
                            value={backgroundColor}
                            onChange={(e) => onBackgroundChange(e.target.value)}
                        />
                        <div className="sidebar-color-info">
                            <div className="sidebar-color-name">Page Background</div>
                            <div className="sidebar-color-hex">{backgroundColor.toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-label">Typography</div>
                    <div className="font-pairing-selector">
                        {fontPairings.map((pairing, index) => (
                            <button
                                key={index}
                                className={`font-pairing-option ${currentPairing.name === pairing.name ? 'selected' : ''}`}
                                onClick={() => onPairingChange(pairing)}
                            >
                                <div className="font-pairing-preview">
                                    <span
                                        className="heading-preview"
                                        style={{ fontFamily: `'${pairing.heading}', serif` }}
                                    >
                                        Aa
                                    </span>
                                    <span
                                        className="body-preview"
                                        style={{ fontFamily: `'${pairing.body}', sans-serif` }}
                                    >
                                        The quick brown fox
                                    </span>
                                </div>
                                <div className="font-pairing-meta">
                                    <span className="font-pairing-name">{pairing.name}</span>
                                    <span className="font-pairing-classification">{pairing.classification}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="sidebar-footer">
                <button className="sidebar-export-btn" onClick={handleExport}>
                    Export for AI Agent
                </button>
                <button className="sidebar-reset-btn" onClick={handleResetAll}>
                    Reset to Defaults
                </button>
            </div>
        </div>
        {showExport && createPortal(
            <div className="export-modal" onClick={() => setShowExport(false)}>
                <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="export-modal-header">
                        <h3>Design System Spec</h3>
                        <button className="export-modal-close" onClick={() => setShowExport(false)}>&times;</button>
                    </div>
                    <div className="export-modal-body">
                        <pre className="export-text">{exportText}</pre>
                    </div>
                    <div className="export-modal-footer">
                        <button className="export-copy-btn" onClick={handleCopyExport}>
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )}
        </>
    );
}

// Gear toggle button component
function GearToggle({ isActive, onClick }) {
    return (
        <button
            className={`gear-toggle ${isActive ? 'active' : ''}`}
            onClick={onClick}
            title={isActive ? 'Close editor' : 'Customize'}
        >
            &#9881;
        </button>
    );
}

// TypeInfo component
function TypeInfo({ currentPairing }) {
    return (
        <>
            <div>
                <div className="section-label">Typeface</div>
                <div className="type-description">
                    {currentPairing.description}
                </div>
            </div>
            <div className="type-weights">
                <div className="weight-card">
                    <div className="weight-sample">Aa</div>
                    <div className="weight-name">Regular 400</div>
                </div>
                <div className="weight-card">
                    <div className="weight-sample">Aa</div>
                    <div className="weight-name">Medium 500</div>
                </div>
                <div className="weight-card">
                    <div className="weight-sample">Aa</div>
                    <div className="weight-name">Bold 700</div>
                </div>
            </div>
        </>
    );
}

// BrandColors component with sidebar color editing
function BrandColors() {
    const scales = ['primary', 'secondary', 'accent', 'neutral'];
    const samples = [900, 600, 400];
    const [isMounted, setIsMounted] = useState(false);

    const defaultScales = {
        primary: greenScale,
        secondary: emberScale,
        accent: blueScale,
        neutral: stoneScale,
    };

    const defaultBackground = '#0a0a0a';
    const defaultPairing = fontPairings[0];

    const [currentScales, setCurrentScales] = useState(defaultScales);
    const [backgroundColor, setBackgroundColor] = useState(defaultBackground);
    const [currentPairing, setCurrentPairing] = useState(defaultPairing);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        setIsMounted(true);
        try {
            const stored = localStorage.getItem('brandColors');
            if (stored) setCurrentScales(JSON.parse(stored));
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }

        try {
            const stored = localStorage.getItem('backgroundColor');
            if (stored) setBackgroundColor(stored);
        } catch (error) {
            console.error('Error loading backgroundColor:', error);
        }

        try {
            const stored = localStorage.getItem('fontPairing');
            if (stored) setCurrentPairing(JSON.parse(stored));
        } catch (error) {
            console.error('Error loading fontPairing:', error);
        }
    }, []);

    // Sync to CSS variables and localStorage
    useEffect(() => {
        if (!isMounted) return;
        updateCSSVariables(currentScales);
        try {
            localStorage.setItem('brandColors', JSON.stringify(currentScales));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }, [currentScales, isMounted]);

    useEffect(() => {
        if (!isMounted) return;
        document.documentElement.style.setProperty('--black', backgroundColor);
        try {
            localStorage.setItem('backgroundColor', backgroundColor);
        } catch (error) {
            console.error('Error saving backgroundColor:', error);
        }
    }, [backgroundColor, isMounted]);

    useEffect(() => {
        if (!isMounted) return;
        const root = document.documentElement;
        root.style.setProperty('--font-heading', `'${currentPairing.heading}', sans-serif`);
        root.style.setProperty('--font-body', `'${currentPairing.body}', sans-serif`);
        try {
            localStorage.setItem('fontPairing', JSON.stringify(currentPairing));
        } catch (error) {
            console.error('Error saving fontPairing:', error);
        }
    }, [currentPairing, isMounted]);

    useEffect(() => {
        const grid = document.querySelector('.grid');
        if (grid) {
            if (sidebarOpen) {
                grid.classList.add('sidebar-open');
            } else {
                grid.classList.remove('sidebar-open');
            }
        }
    }, [sidebarOpen]);

    const handleColorChange = (scaleName, newScale) => {
        setCurrentScales(prev => ({
            ...prev,
            [scaleName]: newScale
        }));
    };

    const handleBackgroundChange = (newColor) => {
        setBackgroundColor(newColor);
    };

    const handlePairingChange = (pairing) => {
        setCurrentPairing(pairing);
    };

    const handleResetAll = () => {
        setCurrentScales(defaultScales);
        setBackgroundColor(defaultBackground);
        setCurrentPairing(defaultPairing);
    };

    const isLight = (value) => value <= 400;

    return (
        <>
            <div className="color-row no-gap">
                {scales.map(scale => (
                    <div className="color-column" key={scale}>
                        {samples.map(value => (
                            <div
                                className={`color-card ${isLight(value) ? 'light' : ''}`}
                                style={{ backgroundColor: currentScales[scale][value] }}
                                key={value}
                            >
                                <div className="color-values">--{scale}-{value}</div>
                            </div>
                        ))}
                    </div>
                ))}

                <div className="color-column">
                    <div
                        className="color-card"
                        style={{ backgroundColor: backgroundColor, border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <div className="color-values">--black</div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#7a7a7a' }}>
                        <div className="color-values">--gray</div>
                    </div>
                    <div className="color-card light" style={{ backgroundColor: '#ffffff' }}>
                        <div className="color-values">--white</div>
                    </div>
                </div>
            </div>

            <ColorSidebar
                isOpen={sidebarOpen}
                currentScales={currentScales}
                backgroundColor={backgroundColor}
                currentPairing={currentPairing}
                onColorChange={handleColorChange}
                onBackgroundChange={handleBackgroundChange}
                onPairingChange={handlePairingChange}
                onResetAll={handleResetAll}
                onClose={() => setSidebarOpen(false)}
            />

            <GearToggle
                isActive={sidebarOpen}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            />

            {isMounted && createPortal(
                <TypeInfo currentPairing={currentPairing} />,
                document.getElementById('type-info-container')
            )}
        </>
    );
}

export default function ColorSpecPage() {
    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800;900&family=Fraunces:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Source+Sans+3:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Source+Serif+4:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700;800&family=Spectral:wght@300;400;500;600;700&family=Abril+Fatface&family=Bitter:wght@300;400;500;600;700;800&family=Raleway:wght@300;400;500;600;700;800&family=Caprasimo&family=Roboto:wght@300;400;500;700&display=swap');

                :root {
                    --green-50: #f0fdf4;
                    --green-100: #d1f4e0;
                    --green-200: #9de9c5;
                    --green-300: #5dd9a8;
                    --green-400: #0bd684;
                    --green-500: #00b86d;
                    --green-600: #009657;
                    --green-700: #007a47;
                    --green-800: #005f38;
                    --green-900: #003d24;
                    --green-950: #001f12;

                    --caribbean-green: var(--green-400);
                    --mountain-meadow: var(--green-300);
                    --bangladesh-green: var(--green-800);
                    --dark-green: var(--green-950);
                    --pine: var(--green-900);
                    --basil: var(--green-700);
                    --forest: var(--green-600);
                    --frog: var(--green-500);
                    --mint: var(--green-200);
                    --pistachio: var(--green-100);
                    --anti-flash-white: var(--green-50);

                    --ember-50: #fff5f7;
                    --ember-100: #ffe4e9;
                    --ember-200: #ffc9d4;
                    --ember-300: #ff9db0;
                    --ember-400: #ff7e95;
                    --ember-500: #FF5E7E;
                    --ember-600: #e6446a;
                    --ember-700: #c72f56;
                    --ember-800: #a01f42;
                    --ember-900: #6b1530;
                    --ember-950: #3d0a1b;

                    --stone-50: #f7f8f8;
                    --stone-100: #e8eaea;
                    --stone-200: #d1d5d5;
                    --stone-300: #b0b6b6;
                    --stone-400: #909999;
                    --stone-500: #707d7d;
                    --stone-600: #5a6565;
                    --stone-700: #454e4e;
                    --stone-800: #323939;
                    --stone-900: #1f2525;
                    --stone-950: #0f1313;

                    --blue-50: #eff6ff;
                    --blue-100: #dbeafe;
                    --blue-200: #bfdbfe;
                    --blue-300: #93c5fd;
                    --blue-400: #60a5fa;
                    --blue-500: #3b82f6;
                    --blue-600: #2563eb;
                    --blue-700: #1d4ed8;
                    --blue-800: #1e40af;
                    --blue-900: #1e3a8a;
                    --blue-950: #172554;

                    --primary-50: var(--green-50);
                    --primary-100: var(--green-100);
                    --primary-200: var(--green-200);
                    --primary-300: var(--green-300);
                    --primary-400: var(--green-400);
                    --primary-500: var(--green-500);
                    --primary-600: var(--green-600);
                    --primary-700: var(--green-700);
                    --primary-800: var(--green-800);
                    --primary-900: var(--green-900);
                    --primary-950: var(--green-950);

                    --secondary-50: var(--ember-50);
                    --secondary-100: var(--ember-100);
                    --secondary-200: var(--ember-200);
                    --secondary-300: var(--ember-300);
                    --secondary-400: var(--ember-400);
                    --secondary-500: var(--ember-500);
                    --secondary-600: var(--ember-600);
                    --secondary-700: var(--ember-700);
                    --secondary-800: var(--ember-800);
                    --secondary-900: var(--ember-900);
                    --secondary-950: var(--ember-950);

                    --neutral-50: var(--stone-50);
                    --neutral-100: var(--stone-100);
                    --neutral-200: var(--stone-200);
                    --neutral-300: var(--stone-300);
                    --neutral-400: var(--stone-400);
                    --neutral-500: var(--stone-500);
                    --neutral-600: var(--stone-600);
                    --neutral-700: var(--stone-700);
                    --neutral-800: var(--stone-800);
                    --neutral-900: var(--stone-900);
                    --neutral-950: var(--stone-950);

                    --accent-50: var(--blue-50);
                    --accent-100: var(--blue-100);
                    --accent-200: var(--blue-200);
                    --accent-300: var(--blue-300);
                    --accent-400: var(--blue-400);
                    --accent-500: var(--blue-500);
                    --accent-600: var(--blue-600);
                    --accent-700: var(--blue-700);
                    --accent-800: var(--blue-800);
                    --accent-900: var(--blue-900);
                    --accent-950: var(--blue-950);

                    --ember: var(--ember-500);
                    --stone: var(--stone-500);

                    --gray: #7a7a7a;
                    --black: #0a0a0a;
                    --white: #ffffff;

                    --font-heading: 'Space Grotesk', sans-serif;
                    --font-body: 'Space Grotesk', sans-serif;

                    --grid-gap: 24px;
                    --row-height: 120px;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: var(--font-body);
                    background-color: var(--black);
                    color: var(--white);
                    font-size: 14px;
                    line-height: 1.5;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--grid-gap);
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: var(--grid-gap);
                    transition: margin-right 300ms ease;
                }

                .grid.sidebar-open {
                    margin-right: 280px;
                }

                .page-header {
                    grid-column: 1 / -1;
                    padding-top: 40px;
                    margin-bottom: 24px;
                }

                .page-header h2 {
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0 0 24px 0;
                    color: white;
                }

                .page-divider {
                    height: 3px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                }

                .section-label {
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--stone);
                    margin-bottom: 12px;
                }

                .header {
                    grid-column: 1 / -1;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--grid-gap);
                    padding: 60px 0 40px;
                    margin-bottom: 30px;
                }

                .header-title {
                    grid-column: span 2;
                }

                .header-title h1 {
                    font-size: 48px;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    line-height: 1;
                    margin-bottom: 8px;
                }

                .header-title .version {
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--caribbean-green);
                }

                .header-intro {
                    grid-column: span 2;
                    font-size: 13px;
                    line-height: 1.7;
                    color: rgba(255,255,255,0.7);
                }

                .typography-section {
                    grid-column: 1 / -1;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--grid-gap);
                    padding-bottom: 40px;
                    margin-bottom: 30px;
                }

                .type-specimen {
                    grid-column: span 2;
                }

                .type-display {
                    font-family: var(--font-heading);
                    font-size: 120px;
                    font-weight: 700;
                    line-height: 0.9;
                    letter-spacing: -0.03em;
                    margin-bottom: 24px;
                }

                .type-alphabet {
                    margin-bottom: 24px;
                }

                .type-row {
                    margin-bottom: 16px;
                }

                .type-row.uppercase {
                    font-family: var(--font-heading);
                    font-size: 24px;
                    font-weight: 500;
                    letter-spacing: 0.02em;
                }

                .type-row.lowercase {
                    font-family: var(--font-heading);
                    font-size: 20px;
                    font-weight: 400;
                    letter-spacing: 0.01em;
                    color: rgba(255,255,255,0.8);
                }

                .type-row.digits {
                    font-family: var(--font-heading);
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    color: var(--caribbean-green);
                }

                .type-info {
                    grid-column: span 2;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .type-description {
                    font-size: 13px;
                    line-height: 1.7;
                    color: rgba(255,255,255,0.7);
                    margin-bottom: 32px;
                }

                .type-weights {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                .weight-card {
                    padding: 20px;
                    border-radius: 3px;
                }

                .weight-sample {
                    font-family: var(--font-heading);
                    font-size: 36px;
                    margin-bottom: 12px;
                }

                .weight-card:nth-child(1) { background: var(--primary-900); }
                .weight-card:nth-child(2) { background: var(--secondary-900); }
                .weight-card:nth-child(3) { background: var(--accent-900); }

                .weight-card:nth-child(1) .weight-sample { font-weight: 400; }
                .weight-card:nth-child(2) .weight-sample { font-weight: 500; }
                .weight-card:nth-child(3) .weight-sample { font-weight: 700; }

                .weight-name {
                    font-size: 10px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .weight-card:nth-child(1) .weight-name { color: var(--primary-300); }
                .weight-card:nth-child(2) .weight-name { color: var(--secondary-300); }
                .weight-card:nth-child(3) .weight-name { color: var(--accent-300); }

                .color-section {
                    grid-column: 1 / -1;
                    margin-bottom: var(--grid-gap);
                }

                .color-section .section-label {
                    margin-bottom: 24px;
                }

                .color-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--grid-gap);
                    margin-bottom: var(--grid-gap);
                }

                .color-row.no-gap {
                    gap: 0;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                }

                .color-column {
                    display: flex;
                    flex-direction: column;
                }

                .color-row.no-gap .color-card.large {
                    height: calc(var(--row-height) * 2);
                }

                .color-card {
                    height: var(--row-height);
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    position: relative;
                }

                .color-card.large {
                    grid-column: span 2;
                    grid-row: span 2;
                    height: calc(var(--row-height) * 2 + var(--grid-gap));
                }

                .color-name {
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }

                .color-values {
                    font-size: 10px;
                    font-family: 'SF Mono', 'Monaco', monospace;
                    line-height: 1.6;
                    opacity: 0.8;
                }

                .color-card.light {
                    color: var(--black);
                }

                .editorial-section {
                    grid-column: 1 / -1;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--grid-gap);
                    margin-bottom: 60px;
                }

                .card-span-1 { grid-column: span 1; align-self: stretch; }
                .card-span-2 { grid-column: span 2; align-self: stretch; }
                .card-span-3 { grid-column: span 3; align-self: stretch; }
                .card-span-4 { grid-column: span 4; align-self: stretch; }

                .card {
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 240px;
                    border-radius: 3px;
                    height: 100%;
                }

                .card.tall {
                    min-height: 360px;
                }

                .card-label {
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                }

                .card-title {
                    font-family: var(--font-heading);
                    font-size: 20px;
                    font-weight: 500;
                    line-height: 1.3;
                    margin-bottom: 12px;
                }

                .card-body {
                    font-size: 13px;
                    line-height: 1.7;
                    color: rgba(255,255,255,0.8);
                    margin-bottom: 24px;
                    flex: 1;
                }

                .card-button {
                    display: inline-block;
                    padding: 10px 20px;
                    border: 1px solid;
                    border-radius: 3px;
                    text-decoration: none;
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    transition: all 200ms ease;
                    align-self: flex-start;
                }

                .card-button:hover {
                    transform: translateY(-1px);
                }

                /* Analytics Widget Styles */
                .analytics-widget {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    cursor: pointer;
                    user-select: none;
                }

                .analytics-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    opacity: 0;
                    transition: opacity 400ms ease 0.1s;
                }

                .analytics-header.loaded {
                    opacity: 1;
                }

                .analytics-header-label {
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .analytics-header-badge {
                    font-size: 9px;
                    font-weight: 500;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    padding: 4px 8px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.1);
                }

                .analytics-number {
                    font-size: 72px;
                    font-weight: 700;
                    line-height: 1;
                    margin-bottom: 24px;
                    opacity: 0;
                    transition: opacity 400ms ease 0.15s;
                }

                .analytics-number.loaded {
                    opacity: 1;
                }

                .analytics-bars {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex: 1;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .analytics-bar-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .analytics-bar-container {
                    width: 100%;
                    height: 120px;
                    display: flex;
                    align-items: flex-end;
                }

                .analytics-bar {
                    width: 100%;
                    height: 0;
                    border-radius: 2px;
                    transition: height 600ms ease;
                }

                .analytics-bar.loaded {
                    height: var(--bar-height);
                }

                .analytics-bar-label {
                    font-size: 9px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    margin-top: 8px;
                    opacity: 0;
                    transition: opacity 300ms ease;
                }

                .analytics-bar-label.loaded {
                    opacity: 0.6;
                }

                /* Activity Widget Styles */
                .activity-widget {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    cursor: pointer;
                    user-select: none;
                }

                .activity-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    opacity: 0;
                    transition: opacity 400ms ease 0.1s;
                }

                .activity-header.loaded {
                    opacity: 1;
                }

                .activity-header-label {
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .activity-header-badge {
                    font-size: 9px;
                    font-weight: 500;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    padding: 4px 8px;
                    border-radius: 10px;
                }

                .activity-number {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 24px;
                    opacity: 0;
                    transition: opacity 400ms ease 0.15s;
                }

                .activity-number.loaded {
                    opacity: 1;
                }

                .activity-number-value {
                    font-size: 72px;
                    font-weight: 700;
                    line-height: 1;
                }

                .activity-number-suffix {
                    font-size: 18px;
                    font-weight: 500;
                    line-height: 1;
                }

                .activity-chart-container {
                    position: relative;
                    width: 100%;
                    height: 80px;
                    margin-bottom: 8px;
                }

                .activity-chart-svg {
                    width: 100%;
                    height: 100%;
                }

                .activity-line-path {
                    fill: none;
                    stroke-width: 2;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    stroke-dasharray: var(--path-length);
                    stroke-dashoffset: var(--path-length);
                    transition: stroke-dashoffset 1.2s ease 0.3s;
                }

                .activity-line-path.loaded {
                    stroke-dashoffset: 0;
                }

                .activity-area-path {
                    opacity: 0;
                    transition: opacity 600ms ease 0.3s;
                }

                .activity-area-path.loaded {
                    opacity: 1;
                }

                .activity-dot {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    animation: dotFadeIn 400ms ease forwards;
                }

                @keyframes dotFadeIn {
                    to { opacity: 1; }
                }

                .activity-day-labels {
                    display: flex;
                    justify-content: space-between;
                    opacity: 0;
                    transition: opacity 400ms ease 0.8s;
                }

                .activity-day-labels.loaded {
                    opacity: 0.6;
                }

                .activity-day-label {
                    font-size: 9px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                /* Sidebar Styles */
                .sidebar {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 280px;
                    height: 100vh;
                    background: rgba(26, 26, 26, 0.98);
                    backdrop-filter: blur(10px);
                    border-left: 1px solid rgba(255,255,255,0.1);
                    transform: translateX(100%);
                    transition: transform 300ms ease;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .sidebar.open {
                    transform: translateX(0);
                }

                .sidebar-header {
                    padding: 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .sidebar-header h2 {
                    font-size: 18px;
                    font-weight: 600;
                }

                .sidebar-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 28px;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.6;
                    transition: opacity 200ms ease;
                }

                .sidebar-close:hover {
                    opacity: 1;
                }

                .sidebar-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .sidebar-section {
                    margin-bottom: 32px;
                }

                .sidebar-section-label {
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.5);
                    margin-bottom: 16px;
                }

                .sidebar-color-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .sidebar-color-input {
                    width: 40px;
                    height: 40px;
                    border: 2px solid #1a1a1a;
                    border-radius: 4px;
                    cursor: pointer;
                    outline: none;
                }

                .sidebar-color-input::-webkit-color-swatch-wrapper {
                    padding: 0;
                }

                .sidebar-color-input::-webkit-color-swatch {
                    border: none;
                    border-radius: 2px;
                }

                .sidebar-color-info {
                    flex: 1;
                }

                .sidebar-color-name {
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 2px;
                }

                .sidebar-color-hex {
                    font-size: 11px;
                    font-family: 'SF Mono', 'Monaco', monospace;
                    color: rgba(255,255,255,0.5);
                }

                .font-pairing-selector {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .font-pairing-option {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 4px;
                    padding: 12px;
                    cursor: pointer;
                    transition: all 200ms ease;
                    text-align: left;
                }

                .font-pairing-option:hover {
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(255,255,255,0.2);
                }

                .font-pairing-option.selected {
                    background: rgba(255,255,255,0.15);
                    border-color: var(--primary-400);
                }

                .font-pairing-preview {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .heading-preview {
                    font-size: 24px;
                    font-weight: 700;
                    color: white;
                }

                .body-preview {
                    font-size: 11px;
                    color: white;
                    opacity: 0.7;
                }

                .font-pairing-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .font-pairing-name {
                    font-size: 11px;
                    font-weight: 500;
                    color: white;
                }

                .font-pairing-classification {
                    font-size: 10px;
                    color: white;
                    opacity: 0.5;
                }

                .sidebar-footer {
                    padding: 24px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .sidebar-export-btn {
                    width: 100%;
                    padding: 12px;
                    background: var(--primary-600);
                    border: 1px solid var(--primary-400);
                    border-radius: 4px;
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 200ms ease;
                }

                .sidebar-export-btn:hover {
                    background: var(--primary-500);
                }

                .sidebar-reset-btn {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 4px;
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 200ms ease;
                }

                .sidebar-reset-btn:hover {
                    background: rgba(255,255,255,0.1);
                }

                .export-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 24px;
                }

                .export-modal-content {
                    background: #1a1a1a;
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 12px;
                    max-width: 700px;
                    width: 100%;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                }

                .export-modal-header {
                    padding: 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .export-modal-header h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: white;
                }

                .export-modal-close {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.6);
                    font-size: 32px;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 200ms;
                }

                .export-modal-close:hover {
                    color: white;
                }

                .export-modal-body {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }

                .export-text {
                    background: #0a0a0a;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 6px;
                    padding: 16px;
                    color: #ccc;
                    font-size: 13px;
                    line-height: 1.6;
                    font-family: 'Space Mono', monospace;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    margin: 0;
                }

                .export-modal-footer {
                    padding: 24px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    justify-content: flex-end;
                }

                .export-copy-btn {
                    padding: 12px 24px;
                    background: var(--primary-600);
                    border: 1px solid var(--primary-400);
                    border-radius: 6px;
                    color: white;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 200ms ease;
                }

                .export-copy-btn:hover {
                    background: var(--primary-500);
                }

                .gear-toggle {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 200ms ease;
                    z-index: 999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .gear-toggle:hover {
                    background: rgba(255,255,255,0.15);
                    transform: rotate(45deg);
                }

                .gear-toggle.active {
                    background: var(--primary-600);
                    border-color: var(--primary-400);
                }

                @media (max-width: 1024px) {
                    .grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .header,
                    .typography-section,
                    .editorial-section {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .type-display {
                        font-size: 80px;
                    }
                }

                @media (max-width: 768px) {
                    .grid {
                        grid-template-columns: 1fr;
                    }

                    .header,
                    .typography-section,
                    .editorial-section {
                        grid-template-columns: 1fr;
                    }

                    .card-span-1,
                    .card-span-2,
                    .card-span-3,
                    .card-span-4 {
                        grid-column: span 1;
                    }

                    .type-display {
                        font-size: 64px;
                    }

                    .sidebar {
                        width: 100%;
                    }

                    .grid.sidebar-open {
                        margin-right: 0;
                    }
                }
            `}</style>

            <div className="grid">
                <div className="page-header">
                    <h2>Brand Guidelines</h2>
                    <div className="page-divider"></div>
                </div>

                <div className="typography-section">
                    <div className="type-specimen">
                        <div className="type-display">Aa</div>
                        <div className="type-alphabet">
                            <div className="type-row uppercase">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
                            <div className="type-row lowercase">abcdefghijklmnopqrstuvwxyz</div>
                            <div className="type-row digits">0123456789</div>
                        </div>
                    </div>
                    <div className="type-info" id="type-info-container">
                        {/* TypeInfo will be portaled here */}
                    </div>
                </div>

                <div className="color-section">
                    <div className="section-label">Color Palette</div>
                    <BrandColors />
                </div>

                <div className="editorial-section">
                    <div className="card-span-2">
                        <Card colorScale="primary">
                            <CardLabel>Brand Personality</CardLabel>
                            <CardTitle>Confident but approachable</CardTitle>
                            <CardBody>Stratum speaks with authority without being cold. We lead with clarity, not complexity.</CardBody>
                            <CardButton>Learn More</CardButton>
                        </Card>
                    </div>

                    <div className="card-span-2">
                        <Card colorScale="neutral">
                            <CardLabel>Hierarchy</CardLabel>
                            <CardTitle>Lead with intention</CardTitle>
                            <CardBody>Every layout should have a clear entry point. Guide the eye through deliberate scale contrast.</CardBody>
                            <CardButton>Learn More</CardButton>
                        </Card>
                    </div>

                    <div className="card-span-1 tall">
                        <Card colorScale="secondary">
                            <ActivityChartWidget colorScale="secondary" chartColor="primary" />
                        </Card>
                    </div>

                    <div className="card-span-1 tall">
                        <Card colorScale="secondary">
                            <AnalyticsWidget colorScale="secondary" chartColor="neutral" />
                        </Card>
                    </div>

                    <div className="card-span-1">
                        <Card colorScale="secondary">
                            <CardLabel>Evolution</CardLabel>
                            <CardTitle>Built to grow</CardTitle>
                            <CardBody>A living system that adapts without losing coherence.</CardBody>
                            <CardButton>Learn More</CardButton>
                        </Card>
                    </div>

                    <div className="card-span-1">
                        <Card colorScale="accent">
                            <CardLabel>Tone of Voice</CardLabel>
                            <CardTitle>Clear. Precise. Human.</CardTitle>
                            <CardBody>Write like you're explaining something important to a smart friend.</CardBody>
                            <CardButton>Learn More</CardButton>
                        </Card>
                    </div>

                    <div className="card-span-2">
                        <Card colorScale="neutral">
                            <CardLabel>Application</CardLabel>
                            <CardTitle>Consistency over uniformity</CardTitle>
                            <CardBody>Recognition across touchpoints while allowing variation for context.</CardBody>
                            <CardButton>Learn More</CardButton>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
