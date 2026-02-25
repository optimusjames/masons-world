import s from '../styles.module.css';

type TypeInfoProps = {
    currentPairing: { description: string };
};

export function TypeInfo({ currentPairing }: TypeInfoProps) {
    return (
        <>
            <div>
                <div className={s['section-label']}>Typeface</div>
                <div className={s['type-description']}>
                    {currentPairing.description}
                </div>
            </div>
            <div className={s['type-weights']}>
                <div className={s['weight-card']}>
                    <div className={s['weight-sample']}>Aa</div>
                    <div className={s['weight-name']}>Regular 400</div>
                </div>
                <div className={s['weight-card']}>
                    <div className={s['weight-sample']}>Aa</div>
                    <div className={s['weight-name']}>Medium 500</div>
                </div>
                <div className={s['weight-card']}>
                    <div className={s['weight-sample']}>Aa</div>
                    <div className={s['weight-name']}>Bold 700</div>
                </div>
            </div>
        </>
    );
}
