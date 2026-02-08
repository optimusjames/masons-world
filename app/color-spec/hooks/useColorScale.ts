import chroma from 'chroma-js';

export function generateScale(baseColor: string) {
    try {
        const lightScale = chroma.scale([
            chroma(baseColor).brighten(3.5),
            baseColor
        ])
        .mode('lch')
        .correctLightness()
        .colors(10);

        const color950 = chroma(baseColor).darken(0.8).hex();

        const values = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
        const scale: Record<number, string> = {};
        values.forEach((value, index) => {
            scale[value] = lightScale[index];
        });
        scale[950] = color950;

        return scale;
    } catch (error) {
        console.error('Error generating scale:', error);
        return null;
    }
}

export function updateCSSVariables(scales: any) {
    const root = document.documentElement;
    const colorNameMap: Record<string, string> = {
        primary: 'green',
        secondary: 'ember',
        accent: 'blue',
        neutral: 'stone'
    };

    Object.entries(scales).forEach(([scaleName, scaleObj]) => {
        Object.entries(scaleObj as Record<string, string>).forEach(([value, color]) => {
            root.style.setProperty(`--${scaleName}-${value}`, color);
            const colorName = colorNameMap[scaleName];
            if (colorName) {
                root.style.setProperty(`--${colorName}-${value}`, color);
            }
        });
    });
}
