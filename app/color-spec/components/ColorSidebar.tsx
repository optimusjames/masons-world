import { useState } from 'react';
import { createPortal } from 'react-dom';
import { generateScale } from '../hooks/useColorScale';
import { fontPairings } from '../data/fontPairings';

type ColorSidebarProps = {
    isOpen: boolean;
    currentScales: any;
    backgroundColor: string;
    currentPairing: any;
    onColorChange: (scaleName: string, newScale: any) => void;
    onBackgroundChange: (newColor: string) => void;
    onPairingChange: (pairing: any) => void;
    onResetAll: () => void;
    onClose: () => void;
};

export function ColorSidebar({
    isOpen,
    currentScales,
    backgroundColor,
    currentPairing,
    onColorChange,
    onBackgroundChange,
    onPairingChange,
    onResetAll,
    onClose
}: ColorSidebarProps) {
    const [showExport, setShowExport] = useState(false);
    const [exportText, setExportText] = useState('');

    const colorNames: Record<string, string> = {
        primary: 'Primary',
        secondary: 'Secondary',
        accent: 'Accent',
        neutral: 'Neutral'
    };

    const handleColorChange = (scaleName: string, newBaseColor: string) => {
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
