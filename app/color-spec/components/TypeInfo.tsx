type TypeInfoProps = {
    currentPairing: any;
};

export function TypeInfo({ currentPairing }: TypeInfoProps) {
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
