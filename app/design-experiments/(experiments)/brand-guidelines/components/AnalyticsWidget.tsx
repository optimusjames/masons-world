import { useState, useEffect, useCallback } from 'react';
import s from '../styles.module.css';

type AnalyticsWidgetProps = {
    colorScale?: string;
    chartColor?: string;
};

export function AnalyticsWidget({ colorScale = 'secondary', chartColor = 'secondary' }: AnalyticsWidgetProps) {
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

    const formatTotal = (num: number) => {
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
            className={s['analytics-widget']}
            onClick={handleReload}
        >
            <div
                className={`${s['analytics-header']} ${isLoaded ? s.loaded : ''}`}
                style={{ color: textColor }}
            >
                <span className={s['analytics-header-label']}>ANALYTICS</span>
                <span className={s['analytics-header-badge']}>This Week</span>
            </div>

            <div
                className={`${s['analytics-number']} ${isLoaded ? s.loaded : ''}`}
                style={{ color: textColor }}
            >
                {formatTotal(values.total)}
            </div>

            <div className={s['analytics-bars']}>
                {values.bars.map((height, i) => (
                    <div className={s['analytics-bar-column']} key={i}>
                        <div className={s['analytics-bar-container']}>
                            <div
                                className={`${s['analytics-bar']} ${isLoaded ? s.loaded : ''}`}
                                style={{
                                    ['--bar-height' as string]: `${height}%`,
                                    background: `linear-gradient(to top, ${barColor} 50%, rgba(255,255,255,0.15) 50%)`,
                                    transitionDelay: `${0.2 + i * 0.05}s`
                                }}
                            />
                        </div>
                        <span
                            className={`${s['analytics-bar-label']} ${isLoaded ? s.loaded : ''}`}
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
