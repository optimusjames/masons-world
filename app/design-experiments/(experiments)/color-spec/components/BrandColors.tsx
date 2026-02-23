import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateCSSVariables } from '../hooks/useColorScale';
import { greenScale, emberScale, blueScale, stoneScale, fontPairings } from '../data/fontPairings';
import { ColorSidebar } from './ColorSidebar';
import { TypeInfo } from './TypeInfo';

export function BrandColors() {
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

    const handleColorChange = (scaleName: string, newScale: Record<number, string>) => {
        setCurrentScales(prev => ({
            ...prev,
            [scaleName]: newScale
        }));
    };

    const handleBackgroundChange = (newColor: string) => {
        setBackgroundColor(newColor);
    };

    const handlePairingChange = (pairing: typeof defaultPairing) => {
        setCurrentPairing(pairing);
    };

    const handleResetAll = () => {
        setCurrentScales(defaultScales);
        setBackgroundColor(defaultBackground);
        setCurrentPairing(defaultPairing);
    };

    const isLight = (value: number) => value <= 400;

    return (
        <>
            <div className="color-row no-gap">
                {scales.map(scale => (
                    <div className="color-column" key={scale}>
                        {samples.map(value => (
                            <div
                                className={`color-card ${isLight(value) ? 'light' : ''}`}
                                style={{ backgroundColor: currentScales[scale as keyof typeof currentScales][value as keyof typeof greenScale] }}
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

            {isMounted && createPortal(
                <ColorSidebar
                    currentScales={currentScales}
                    backgroundColor={backgroundColor}
                    currentPairing={currentPairing}
                    onColorChange={handleColorChange}
                    onBackgroundChange={handleBackgroundChange}
                    onPairingChange={handlePairingChange}
                    onResetAll={handleResetAll}
                />,
                document.getElementById('sidebar-container')!
            )}

            {isMounted && createPortal(
                <TypeInfo currentPairing={currentPairing} />,
                document.getElementById('type-info-container')!
            )}
        </>
    );
}
