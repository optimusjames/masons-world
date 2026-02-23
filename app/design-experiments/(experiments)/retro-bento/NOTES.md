# Retro Bento -- Design Notes

## Concept
Bento grid of fictional hardware modules. Not fitness, not real data -- impossible tech (time dilation, flux capacitors, neural pathways, entropy engines, stasis chambers). Each cell is a self-contained "rack-mount module" with brushed aluminum panels, LCD displays, and interactive controls.

## Visual Direction (Established)
- **LCD, not CRT** -- light grey-green background (#c5cabb), dark charcoal text (#3a3e36). No scanlines. Flat.
- **Monotone palette** -- grey tones at different opacities for data viz (arcs, zone bars, LED matrix). No color variety. Only the orange accent (#e8622c) for active states, LED indicators, and the hottest LED dots.
- **No page background** -- transparent, picks up site light theme.
- **Aluminum panels** -- beveled shadows, corner screws, inset LCD wells. Warm grey surface (#e2e0dc).
- **Typography** -- DM Mono (technical readouts), Archivo Narrow (engraved labels/plates).

## Interactive Controls (Self-Contained)
All use pointer events with setPointerCapture for smooth drag:
- **Knob** -- rotary drag (vertical movement maps to rotation). 270-degree sweep. Orange indicator line.
- **Fader** -- vertical slider with thumb. Direct position mapping.
- **Toggle** -- pill switch, spring-animated thumb. Click to toggle.

## Grid
3x3, `grid-template-columns: 280px 240px 280px`, 14px gap, 840px max. Single-column at 520px.

## 9 Modules (Current)
| Position | Module | Controls | Display |
|----------|--------|----------|---------|
| TL | Temporal Coefficient | Knob (dilation) | Needle gauge + pct readout |
| TC | Flux Capacitor | Toggle (armed), click rows | 3 stacked LCD rack modules |
| TR | Spectral Analyzer | Knob (gain) | 7-band VU meters |
| ML | Neural Pathways | Toggle (sync), click grid | 7x10 LED dot matrix |
| MC | Entropy Engine | Toggle (engage) | Scramble text + metrics |
| MR | Phase Scope | Knob (resolution) | Monotone SVG arc chart |
| BL | Memory Bank | Fader (seek) | Epoch log list |
| BC | Resonance | Knob (tune) | Frequency display + zone bar + 2x2 metrics |
| BR | Stasis Chamber | Toggle (chamber), Fader (temp) | Hours LCD + stage strip + metrics |

## File Structure
```
retro-bento/
  page.tsx              # Grid + all 9 widget functions + data
  page.module.css       # Grid layout + CSS custom properties
  layout.tsx            # Metadata only
  NOTES.md              # This file
  components/
    HardwareCard.tsx    # Aluminum panel wrapper with screws
    CrtDisplay.tsx      # LCD inset panel (name is legacy, it's LCD now)
    LedIndicator.tsx    # Single LED dot (off/dim/on/accent)
    LabelPlate.tsx      # Engraved text plate
    NeedleGauge.tsx     # SVG analog gauge with animated needle
    LedMatrix.tsx       # Grid of LED dots, click to shuffle
    SegmentedLedBar.tsx # Vertical discrete-segment bar
    VuMeterBank.tsx     # 7-column meter array
    MetricReadout.tsx   # Small LCD stat tile
    Knob.tsx            # Rotary drag control
    Fader.tsx           # Vertical slider control
    Toggle.tsx          # On/off pill switch
    useCountUp.ts       # Animated number counter hook
    useTextScramble.ts  # Text scramble-in effect hook
    *.module.css        # Each component has its own CSS module
```

## CSS Custom Properties (page.module.css)
```
--surface: #e2e0dc        Panel background
--surface-raised: #eae8e4  Highlight
--surface-inset: #d4d2ce   Recessed
--surface-deep: #c8c6c2    Shadow/depth
--border: #cac8c4          Dividers
--accent: #e8622c          Orange (only color)
--accent-glow: rgba(232, 98, 44, 0.25)
--display-bg: #c5cabb      LCD background
--display-text: #3a3e36    LCD text (dark on light)
--display-dim: #7d8476     LCD secondary text
--display-active: #4a5040  LCD emphasized text
--text-primary: #2a2824    Panel text
--text-secondary: #6b6860  Panel secondary
```

## Key Decisions
- Fully self-contained. No imports from retro-tech or crossfit-bento experiments.
- Widgets are inline functions in page.tsx, not separate files. Shared primitives are in components/.
- AnimatedCard wrapper: staggered entrance (spring), click-to-replay.
- Entrance animations use motion/react (framer motion).
- Knobs/faders respond to the needle gauge and VU meters in real time when dragged.

## What's Next / Could Improve
- Knob/fader values could drive display readouts more (e.g., dilation knob already drives the needle gauge)
- Could add more cross-widget interaction (e.g., flux armed state dims other modules)
- Button component not yet created (plan mentioned tactile buttons)
- Could refine the NeedleGauge SVG viewBox -- currently clips slightly at edges
- Gallery screenshot needed at /public/screenshots/retro-bento.png
- Consider renaming CrtDisplay to LcdDisplay for clarity
