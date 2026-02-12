'use client';

import './styles.css';
import { Card, CardLabel, CardTitle, CardBody, CardButton } from './components/Cards';
import { AnalyticsWidget } from './components/AnalyticsWidget';
import { ActivityWidget } from './components/ActivityWidget';
import { BrandColors } from './components/BrandColors';

export default function ColorSpecPage() {
    return (
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
                        <ActivityWidget colorScale="secondary" chartColor="primary" />
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
    );
}
