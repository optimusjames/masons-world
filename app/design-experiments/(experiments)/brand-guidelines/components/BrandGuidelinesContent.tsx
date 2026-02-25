'use client';

import { useState, useEffect } from 'react';
import s from '../styles.module.css';
import { Card, CardLabel, CardTitle, CardBody, CardButton } from './Cards';
import { AnalyticsWidget } from './AnalyticsWidget';
import { ActivityWidget } from './ActivityWidget';
import { BrandColors } from './BrandColors';

const c = (classes: string) => classes.split(' ').map(n => s[n]).filter(Boolean).join(' ');

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800;900&family=Fraunces:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Source+Sans+3:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Source+Serif+4:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700;800&family=Spectral:wght@300;400;500;600;700&family=Abril+Fatface&family=Bitter:wght@300;400;500;600;700;800&family=Raleway:wght@300;400;500;600;700;800&family=Caprasimo&family=Roboto:wght@300;400;500;700&display=swap';

export function BrandGuidelinesContent() {
    const [fontsReady, setFontsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const markReady = () => {
            if (!cancelled) setFontsReady(true);
        };

        // Explicitly load the default heading font so we don't
        // rely on lazy CSS @font-face loading (which causes
        // document.fonts.ready to resolve before fonts download)
        const loadFonts = () => {
            document.fonts.load('400 1em "Space Grotesk"')
                .then(() => document.fonts.load('700 1em "Space Grotesk"'))
                .then(markReady)
                .catch(markReady);
        };

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_URL;
        link.onload = loadFonts;
        link.onerror = markReady;
        document.head.appendChild(link);

        // Also attempt directly in case stylesheet was cached and onload missed
        requestAnimationFrame(loadFonts);

        const fallback = setTimeout(markReady, 3000);

        return () => {
            cancelled = true;
            clearTimeout(fallback);
        };
    }, []);

    return (
        <div className={c('page-layout')}>
            {!fontsReady && (
                <div className={c('loadingScreen')}>
                    <span className={c('loadingText')}>Loading fonts...</span>
                </div>
            )}
            <div className={`${s.content}${fontsReady ? ` ${s.ready}` : ''}`}>
                <div className={c('grid')}>
                    <div className={c('editorial-section')}>
                        <div className={c('card-span-2')}>
                            <Card colorScale="primary">
                                <CardLabel>Brand Personality</CardLabel>
                                <CardTitle>Confident but approachable</CardTitle>
                                <CardBody>Stratum speaks with authority without being cold. We lead with clarity, not complexity.</CardBody>
                                <CardButton>Learn More</CardButton>
                            </Card>
                        </div>

                        <div className={c('card-span-2')}>
                            <Card colorScale="neutral">
                                <CardLabel>Hierarchy</CardLabel>
                                <CardTitle>Lead with intention</CardTitle>
                                <CardBody>Every layout should have a clear entry point. Guide the eye through deliberate scale contrast.</CardBody>
                                <CardButton>Learn More</CardButton>
                            </Card>
                        </div>

                        <div className={c('card-span-1 tall')}>
                            <Card colorScale="secondary">
                                <ActivityWidget colorScale="secondary" chartColor="primary" />
                            </Card>
                        </div>

                        <div className={c('card-span-1 tall')}>
                            <Card colorScale="secondary">
                                <AnalyticsWidget colorScale="secondary" chartColor="neutral" />
                            </Card>
                        </div>

                        <div className={c('card-span-1')}>
                            <Card colorScale="secondary">
                                <CardLabel>Evolution</CardLabel>
                                <CardTitle>Built to grow</CardTitle>
                                <CardBody>A living system that adapts without losing coherence.</CardBody>
                                <CardButton>Learn More</CardButton>
                            </Card>
                        </div>

                        <div className={c('card-span-1')}>
                            <Card colorScale="accent">
                                <CardLabel>Tone of Voice</CardLabel>
                                <CardTitle>Clear. Precise. Human.</CardTitle>
                                <CardBody>Write like you're explaining something important to a smart friend.</CardBody>
                                <CardButton>Learn More</CardButton>
                            </Card>
                        </div>

                        <div className={c('card-span-2')}>
                            <Card colorScale="neutral">
                                <CardLabel>Application</CardLabel>
                                <CardTitle>Consistency over uniformity</CardTitle>
                                <CardBody>Recognition across touchpoints while allowing variation for context.</CardBody>
                                <CardButton>Learn More</CardButton>
                            </Card>
                        </div>
                    </div>

                    <div className={c('typography-section')}>
                        <div className={c('type-specimen')}>
                            <div className={c('type-display')}>Aa</div>
                            <div className={c('type-alphabet')}>
                                <div className={c('type-row uppercase')}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
                                <div className={c('type-row lowercase')}>abcdefghijklmnopqrstuvwxyz</div>
                                <div className={c('type-row digits')}>0123456789</div>
                            </div>
                        </div>
                        <div className={c('type-info')} id="type-info-container">
                            {/* TypeInfo will be portaled here */}
                        </div>
                    </div>

                    <div className={c('color-section')}>
                        <div className={c('section-label')}>Color Palette</div>
                        <BrandColors />
                    </div>
                </div>
            </div>
            <div id="sidebar-container"></div>
        </div>
    );
}
