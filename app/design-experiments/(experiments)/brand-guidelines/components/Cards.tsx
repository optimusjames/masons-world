import { useContext, createContext } from 'react';
import { defaults } from '../data/fontPairings';
import s from '../styles.module.css';

const CardContext = createContext<string | undefined>(undefined);

export function Card({ colorScale = 'neutral', bg, children }: { colorScale?: string; bg?: string; children: React.ReactNode }) {
    const bgValue = bg || defaults.bg;
    const backgroundColor = `var(--${colorScale}-${bgValue})`;

    return (
        <CardContext.Provider value={colorScale}>
            <div className={s.card} style={{ backgroundColor }}>
                {children}
            </div>
        </CardContext.Provider>
    );
}

export function CardLabel({ children, color }: { children: React.ReactNode; color?: string }) {
    const colorScale = useContext(CardContext);
    const colorValue = color || defaults.label;
    const textColor = `var(--${colorScale}-${colorValue})`;

    return (
        <div className={s['card-label']} style={{ color: textColor }}>
            {children}
        </div>
    );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className={s['card-title']}>
            {children}
        </h3>
    );
}

export function CardBody({ children }: { children: React.ReactNode }) {
    return (
        <p className={s['card-body']}>
            {children}
        </p>
    );
}

export function CardButton({ children, bg, border, textColor }: { children: React.ReactNode; bg?: string; border?: string; textColor?: string }) {
    const colorScale = useContext(CardContext);
    const bgValue = bg || defaults.buttonBg;
    const borderValue = border || defaults.buttonBorder;
    const textValue = textColor || defaults.buttonText;

    return (
        <a
            href="#"
            className={s['card-button']}
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
