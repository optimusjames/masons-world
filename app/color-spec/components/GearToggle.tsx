type GearToggleProps = {
    isActive: boolean;
    onClick: () => void;
};

export function GearToggle({ isActive, onClick }: GearToggleProps) {
    return (
        <button
            className={`gear-toggle ${isActive ? 'active' : ''}`}
            onClick={onClick}
            title={isActive ? 'Close editor' : 'Customize'}
        >
            &#9881;
        </button>
    );
}
