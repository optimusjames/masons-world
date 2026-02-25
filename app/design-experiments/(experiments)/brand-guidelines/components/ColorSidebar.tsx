import { useState } from 'react';
import { createPortal } from 'react-dom';
import { generateScale } from '../hooks/useColorScale';
import { fontPairings } from '../data/fontPairings';
import s from '../styles.module.css';

type ColorScale = Record<number, string>;

type FontPairing = {
    name: string;
    heading: string;
    body: string;
    classification: string;
    description: string;
};

type ColorSidebarProps = {
    currentScales: Record<string, ColorScale>;
    backgroundColor: string;
    currentPairing: FontPairing;
    onColorChange: (scaleName: string, newScale: ColorScale) => void;
    onBackgroundChange: (newColor: string) => void;
    onPairingChange: (pairing: FontPairing) => void;
    onResetAll: () => void;
};

export function ColorSidebar({
    currentScales,
    backgroundColor,
    currentPairing,
    onColorChange,
    onBackgroundChange,
    onPairingChange,
    onResetAll,
}: ColorSidebarProps) {
    const [activeTab, setActiveTab] = useState<'colors' | 'type'>('colors');
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
        <div className={s.sidebar}>
            <div className={s['sidebar-tabs']}>
                <button
                    className={`${s['sidebar-tab']} ${activeTab === 'colors' ? s.active : ''}`}
                    onClick={() => setActiveTab('colors')}
                >
                    Colors
                </button>
                <button
                    className={`${s['sidebar-tab']} ${activeTab === 'type' ? s.active : ''}`}
                    onClick={() => setActiveTab('type')}
                >
                    Type
                </button>
            </div>
            <div className={s['sidebar-body']}>
                {activeTab === 'colors' && (
                    <div className={s['sidebar-section']}>
                        {Object.entries(colorNames).map(([scaleName, displayName]) => (
                            <div className={s['sidebar-color-row']} key={scaleName}>
                                <input
                                    type="color"
                                    className={s['sidebar-color-input']}
                                    value={currentScales[scaleName][900]}
                                    onChange={(e) => handleColorChange(scaleName, e.target.value)}
                                />
                                <div className={s['sidebar-color-info']}>
                                    <div className={s['sidebar-color-name']}>{displayName}</div>
                                    <div className={s['sidebar-color-hex']}>{currentScales[scaleName][900].toUpperCase()}</div>
                                </div>
                            </div>
                        ))}
                        <div className={s['sidebar-color-row']}>
                            <input
                                type="color"
                                className={s['sidebar-color-input']}
                                value={backgroundColor}
                                onChange={(e) => onBackgroundChange(e.target.value)}
                            />
                            <div className={s['sidebar-color-info']}>
                                <div className={s['sidebar-color-name']}>Page Background</div>
                                <div className={s['sidebar-color-hex']}>{backgroundColor.toUpperCase()}</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'type' && (
                    <div className={s['sidebar-section']}>
                        <div className={s['font-pairing-selector']}>
                            {fontPairings.map((pairing, index) => (
                                <button
                                    key={index}
                                    className={`${s['font-pairing-option']} ${currentPairing.name === pairing.name ? s.selected : ''}`}
                                    onClick={() => onPairingChange(pairing)}
                                >
                                    <div className={s['font-pairing-preview']}>
                                        <span
                                            className={s['heading-preview']}
                                            style={{ fontFamily: `'${pairing.heading}', serif` }}
                                        >
                                            Aa
                                        </span>
                                        <div className={s['font-pairing-meta']}>
                                            <span className={s['font-pairing-name']}>{pairing.name}</span>
                                            <span className={s['font-pairing-classification']}>{pairing.classification}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className={s['sidebar-footer']}>
                <button className={s['sidebar-export-btn']} onClick={handleExport}>
                    Export for AI Agent
                </button>
                <button className={s['sidebar-reset-btn']} onClick={handleResetAll}>
                    Reset to Defaults
                </button>
            </div>
        </div>
        {showExport && createPortal(
            <div className={s['export-modal']} onClick={() => setShowExport(false)}>
                <div className={s['export-modal-content']} onClick={(e) => e.stopPropagation()}>
                    <div className={s['export-modal-header']}>
                        <h3>Design System Spec</h3>
                        <button className={s['export-modal-close']} onClick={() => setShowExport(false)}>&times;</button>
                    </div>
                    <div className={s['export-modal-body']}>
                        <pre className={s['export-text']}>{exportText}</pre>
                    </div>
                    <div className={s['export-modal-footer']}>
                        <button className={s['export-copy-btn']} onClick={handleCopyExport}>
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
