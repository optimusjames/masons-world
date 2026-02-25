import { useState, useEffect, useCallback, useRef } from 'react';
import s from '../styles.module.css';

type ActivityWidgetProps = {
    colorScale?: string;
    chartColor?: string;
};

export function ActivityWidget({ colorScale = 'primary', chartColor = 'primary' }: ActivityWidgetProps) {
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const svgRef = useRef<SVGSVGElement>(null);
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
        const path = svgRef.current.querySelector(`.${s['activity-line-path']}`) as SVGPathElement;
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

    const generateSmoothPath = (pts: { x: number; y: number }[]) => {
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

    const generateAreaPath = (pts: { x: number; y: number }[]) => {
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
            className={s['activity-widget']}
            onClick={handleReload}
        >
            <div
                className={`${s['activity-header']} ${isLoaded ? s.loaded : ''}`}
            >
                <span className={s['activity-header-label']} style={{ color: '#ffffff' }}>ACTIVITY</span>
                <span
                    className={s['activity-header-badge']}
                    style={{ background: badgeBg, color: badgeText }}
                >
                    This Week
                </span>
            </div>

            <div className={`${s['activity-number']} ${isLoaded ? s.loaded : ''}`}>
                <span className={s['activity-number-value']} style={{ color: '#ffffff' }}>
                    {values.avg}
                </span>
                <span className={s['activity-number-suffix']} style={{ color: textColor }}>
                    avg
                </span>
            </div>

            <div className={s['activity-chart-container']}>
                <svg
                    ref={svgRef}
                    className={s['activity-chart-svg']}
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                    style={{ ['--path-length' as string]: `${pathLength}px` }}
                >
                    <defs>
                        <linearGradient id={`activityArea-${loadKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={lineColor} stopOpacity="0.6" />
                            <stop offset="100%" stopColor={lineColor} stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <path
                        className={`${s['activity-area-path']} ${isLoaded ? s.loaded : ''}`}
                        d={areaPath}
                        fill={`url(#activityArea-${loadKey})`}
                    />
                    <path
                        className={`${s['activity-line-path']} ${isLoaded ? s.loaded : ''}`}
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
                            className={`${s['activity-dot']} ${isLoaded ? s.loaded : ''}`}
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

            <div className={`${s['activity-day-labels']} ${isLoaded ? s.loaded : ''}`} style={{ color: textColor }}>
                {dayLabels.map((day, i) => (
                    <span key={i} className={s['activity-day-label']}>{day}</span>
                ))}
            </div>
        </div>
    );
}
