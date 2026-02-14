'use client'

import { useState, useEffect } from 'react'
import './styles.css'

const UNIT = 8
const u = (n: number) => n * UNIT

const CONFIG = {
  columns: 4,
  outerMargin: u(8),
  columnGap: u(3),
  rowHeights: {
    wide: u(6),
    narrow: u(1),
  },
}

const FONT = {
  display: "'Suisse Intl', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  body: "'Suisse Intl', 'Helvetica Neue', Helvetica, Arial, sans-serif",
}

const TYPE = {
  h1: { fontSize: 38, lineHeight: `${u(5)}px`, fontWeight: 400, letterSpacing: '-0.02em' } as const,
  h2: { fontSize: 19, lineHeight: `${u(3)}px`, fontWeight: 500, letterSpacing: '-0.01em' } as const,
  body: { fontSize: 13, lineHeight: `${u(2.5)}px`, fontWeight: 400, letterSpacing: '0.005em' } as const,
  caption: { fontSize: 10, lineHeight: `${u(2)}px`, fontWeight: 400, letterSpacing: '0.03em', textTransform: 'uppercase' } as const,
  label: { fontSize: 11, lineHeight: `${u(2)}px`, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' } as const,
}

const C = {
  bg: '#0a0a0a',
  surface: '#141414',
  text: '#e8e8e8',
  textSecondary: '#999',
  textMuted: '#666',
  divider: '#e8e8e8',
  dividerSubtle: '#333',
  placeholder: '#1a1a1a',
  placeholderStroke: '#444',
  accent: '#00d4cc',
  gridColumn: 'rgba(0, 212, 204, 0.04)',
  gridColumnBorder: 'rgba(0, 212, 204, 0.1)',
  gridLine: 'rgba(0, 212, 204, 0.04)',
  gridLineMajor: 'rgba(0, 212, 204, 0.15)',
}

const GridOverlay = ({ visible, rows }: { visible: boolean; rows: number }) => {
  if (!visible) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: CONFIG.outerMargin,
          right: CONFIG.outerMargin,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${CONFIG.columns}, 1fr)`,
          gap: CONFIG.columnGap,
        }}
      >
        {Array.from({ length: CONFIG.columns }).map((_, i) => (
          <div
            key={i}
            style={{
              background: C.gridColumn,
              borderLeft: `1px solid ${C.gridColumnBorder}`,
              borderRight: `1px solid ${C.gridColumnBorder}`,
            }}
          />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, i) => {
        const isMajor = i % 24 === 0
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: i * u(1),
              left: 0,
              right: 0,
              height: 1,
              background: isMajor ? C.gridLineMajor : C.gridLine,
            }}
          />
        )
      })}
    </div>
  )
}

const Section = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div
    style={{
      paddingLeft: CONFIG.outerMargin,
      paddingRight: CONFIG.outerMargin,
      ...style,
    }}
  >
    {children}
  </div>
)

const Grid = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${CONFIG.columns}, 1fr)`,
      gap: `0 ${CONFIG.columnGap}px`,
      ...style,
    }}
  >
    {children}
  </div>
)

const Divider = ({ span = 4, style }: { span?: number; style?: React.CSSProperties }) => (
  <div
    style={{
      gridColumn: `span ${span}`,
      height: 1,
      background: C.divider,
      ...style,
    }}
  />
)

const ThinDivider = ({ span = 4, style }: { span?: number; style?: React.CSSProperties }) => (
  <div
    style={{
      gridColumn: `span ${span}`,
      height: 1,
      background: C.dividerSubtle,
      ...style,
    }}
  />
)

const Spacer = ({ units = 3, span = 4 }: { units?: number; span?: number }) => (
  <div style={{ gridColumn: `span ${span}`, height: u(units) }} />
)

const ImagePlaceholder = ({
  aspectRatio = '4/3',
  height,
  span = 1,
  caption,
  style,
}: {
  aspectRatio?: string
  height?: number
  span?: number
  caption?: string
  style?: React.CSSProperties
}) => (
  <div style={{ gridColumn: `span ${span}`, ...style }}>
    <div
      style={{
        width: '100%',
        ...(height ? { height } : { aspectRatio }),
        background: C.placeholder,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.placeholderStroke} strokeWidth="1">
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
    {caption && (
      <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, marginTop: u(1), marginBottom: 0 }}>
        {caption}
      </p>
    )}
  </div>
)

const StatBlock = ({ number, label, style }: { number: string; label: string; style?: React.CSSProperties }) => (
  <div style={{ ...style }}>
    <div
      style={{
        fontFamily: FONT.display,
        fontSize: 56,
        lineHeight: `${u(8)}px`,
        fontWeight: 300,
        letterSpacing: '-0.03em',
        color: C.text,
      }}
    >
      {number}
    </div>
    <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, marginTop: u(0.5), marginBottom: 0 }}>
      {label}
    </p>
  </div>
)

export default function ModularGridSystem() {
  const [showGrid, setShowGrid] = useState(true)
  const [totalHeight, setTotalHeight] = useState(4000)

  useEffect(() => {
    const measure = () => {
      const el = document.getElementById('grid-page')
      if (el) {
        // Use offsetHeight to get the rendered height without the overlay inflating it
        setTotalHeight(el.offsetHeight)
      }
    }
    // Measure after layout settles
    requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const rows = Math.ceil(totalHeight / UNIT)

  return (
    <div
      style={{
        fontFamily: FONT.body,
        background: C.bg,
        color: C.text,
        minHeight: '100vh',
        position: 'relative',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <button
        onClick={() => setShowGrid(!showGrid)}
        style={{
          position: 'fixed',
          top: u(2),
          right: u(2),
          zIndex: 200,
          background: showGrid ? C.accent : '#333',
          color: '#fff',
          border: 'none',
          padding: `${u(1)}px ${u(2)}px`,
          ...TYPE.label,
          fontFamily: FONT.body,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {showGrid ? 'Grid On' : 'Grid Off'}
      </button>

      <div id="grid-page" style={{ position: 'relative', overflow: 'hidden' }}>
        <GridOverlay visible={showGrid} rows={rows} />

        {/* HEADER */}
        <Section style={{ paddingTop: u(6) }}>
          <Grid>
            <div style={{ gridColumn: 'span 4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ ...TYPE.label, fontFamily: FONT.body, color: C.textMuted }}>
                  Digital Presentation Grid System
                </span>
                <span style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted }}>
                  Format 16:9 &mdash; Four Column Modular
                </span>
              </div>
            </div>
            <Divider style={{ marginTop: u(1.5), marginBottom: u(0) }} />
          </Grid>
        </Section>

        {/* TITLE BLOCK */}
        <Section style={{ paddingTop: u(6) }}>
          <Grid>
            <div style={{ gridColumn: 'span 2' }}>
              <h1
                style={{
                  ...TYPE.h1,
                  fontFamily: FONT.display,
                  margin: 0,
                  paddingBottom: u(3),
                }}
              >
                Modular Grid
                <br />
                System for
                <br />
                Digital Surfaces
              </h1>
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textSecondary }}>
                A systematic approach to vertical rhythm and horizontal alignment, translating
                the precision of Swiss print design into responsive web layouts. Every measurement
                derives from a single base unit.
              </p>
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textSecondary }}>
                The grid enforces consistency across content sections through fixed row heights,
                proportional margins, and typographic snap points. Content flows within the
                structure without breaking it.
              </p>
            </div>
          </Grid>
        </Section>

        {/* DIVIDER */}
        <Section style={{ paddingTop: u(3) }}>
          <Grid>
            <ThinDivider />
          </Grid>
        </Section>

        {/* KEY METRICS */}
        <Section style={{ paddingTop: u(3) }}>
          <Grid>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.label, fontFamily: FONT.body, color: C.textMuted, margin: 0 }}>
                System Specifications
              </p>
            </div>
            <StatBlock number="8px" label="Base unit -- all measurements derive from this" />
            <StatBlock number="4" label="Column count -- consistent horizontal division" />
            <StatBlock number="16:9" label="Section ratio -- proportional content modules" />
          </Grid>
        </Section>

        {/* DIVIDER */}
        <Section style={{ paddingTop: u(6) }}>
          <Grid>
            <Divider />
          </Grid>
        </Section>

        {/* IMAGE + TEXT SECTION */}
        <Section style={{ paddingTop: u(3) }}>
          <Grid>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.label, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(2) }}>
                01 &mdash; Vertical Rhythm
              </p>
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textSecondary }}>
                Every element&apos;s total vertical footprint -- content height plus padding, margin, and border --
                must resolve to a multiple of the base unit.
                This discipline creates the invisible horizontal lines
                that give the layout its cohesion.
              </p>
            </div>
            <ImagePlaceholder
              span={2}
              aspectRatio="16/9"
              caption="Fig. 1 -- Baseline grid overlay showing 8px increments across the full page height"
            />
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textSecondary }}>
                Line-heights snap to the grid, not font sizes. A 13px body font at 20px line-height
                occupies 2.5 units. Headings at 38px use a 40px line-height -- exactly 5 units. The spacing
                between heading and body resolves the remaining offset.
              </p>
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, marginTop: u(2.5), color: C.textSecondary }}>
                This is where most web implementations fail. They pick a type scale and let line-heights
                fall where they may. In print, this would be unacceptable.
              </p>
            </div>
          </Grid>
        </Section>

        {/* DIVIDER */}
        <Section style={{ paddingTop: u(6) }}>
          <Grid>
            <ThinDivider />
          </Grid>
        </Section>

        {/* TWO-COLUMN TEXT */}
        <Section style={{ paddingTop: u(3) }}>
          <Grid>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.label, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(2) }}>
                02 &mdash; Column Structure
              </p>
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <h2
                style={{
                  ...TYPE.h2,
                  fontFamily: FONT.display,
                  margin: 0,
                  marginBottom: u(2),
                }}
              >
                Outer margins are wider
                than column gutters
              </h2>
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textSecondary }}>
                The page margin at 64px is roughly 2.7x the 24px column gutter. This creates a visual
                frame around the content area and prevents the grid from feeling like it runs edge-to-edge.
                Print designers call this &quot;generous margins&quot; -- the white space around the content is as
                important as the content itself.
              </p>
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <h2
                style={{
                  ...TYPE.h2,
                  fontFamily: FONT.display,
                  margin: 0,
                  marginBottom: u(2),
                }}
              >
                Gutters create the
                vertical channels
              </h2>
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textSecondary }}>
                The 24px gutter between columns provides enough separation that adjacent text blocks
                don&apos;t bleed into each other visually, but narrow enough to maintain the feeling
                of a unified grid rather than isolated panels. The gutter width is 3 base units -- a
                deliberate, proportional choice.
              </p>
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <h2
                style={{
                  ...TYPE.h2,
                  fontFamily: FONT.display,
                  margin: 0,
                  marginBottom: u(2),
                }}
              >
                Content spans respond
                to information density
              </h2>
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textSecondary }}>
                Headlines span 2 columns when they need room. Body text stays in single columns for
                comfortable line lengths. Images span 2-3 columns for impact. The grid enables
                these decisions without breaking rhythm.
              </p>
            </div>
          </Grid>
        </Section>

        {/* DIVIDER */}
        <Section style={{ paddingTop: u(6) }}>
          <Grid>
            <Divider />
          </Grid>
        </Section>

        {/* IMAGE GRID */}
        <Section style={{ paddingTop: u(3) }}>
          <Grid>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.label, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(2) }}>
                03 &mdash; Image Treatment
              </p>
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textSecondary }}>
                Images conform to the column grid horizontally and snap to the baseline grid vertically.
                Captions use the smallest type size in the system and align to the same baseline.
              </p>
            </div>
            <ImagePlaceholder
              span={1}
              height={u(24)}
              caption="Fig. 2 -- Single column, fixed height"
            />
            <ImagePlaceholder
              span={2}
              height={u(24)}
              caption="Fig. 3 -- Two columns, same fixed height"
            />
          </Grid>
        </Section>

        <Section style={{ paddingTop: u(3) }}>
          <Grid>
            <Spacer span={1} units={0} />
            <ImagePlaceholder span={1} aspectRatio="3/4" caption="Fig. 4 -- Portrait" />
            <ImagePlaceholder span={1} aspectRatio="3/4" caption="Fig. 5 -- Portrait" />
            <ImagePlaceholder span={1} aspectRatio="3/4" caption="Fig. 6 -- Portrait" />
          </Grid>
        </Section>

        {/* DIVIDER */}
        <Section style={{ paddingTop: u(6) }}>
          <Grid>
            <ThinDivider />
          </Grid>
        </Section>

        {/* TYPE SPECIMEN */}
        <Section style={{ paddingTop: u(3) }}>
          <Grid>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.label, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(2) }}>
                04 &mdash; Type Scale
              </p>
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <div style={{ marginBottom: u(4) }}>
                <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(1) }}>
                  H1 -- 38/40 -- Display
                </p>
                <h1 style={{ ...TYPE.h1, fontFamily: FONT.display, margin: 0 }}>
                  The Quick Brown Fox Jumps Over the Lazy Dog
                </h1>
              </div>
              <div style={{ marginBottom: u(4) }}>
                <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(1) }}>
                  H2 -- 19/24 -- Section Heading
                </p>
                <h2 style={{ ...TYPE.h2, fontFamily: FONT.display, margin: 0 }}>
                  The Quick Brown Fox Jumps Over the Lazy Dog
                </h2>
              </div>
              <div style={{ marginBottom: u(4) }}>
                <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(1) }}>
                  Body -- 13/20 -- Running Text
                </p>
                <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, maxWidth: 480, color: C.textSecondary }}>
                  The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
                  How vexingly quick daft zebras jump. The five boxing wizards jump quickly.
                </p>
              </div>
              <div style={{ marginBottom: u(4) }}>
                <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(1) }}>
                  Caption -- 10/16 -- Image Labels
                </p>
                <p style={{ ...TYPE.caption, fontFamily: FONT.body, margin: 0, color: C.textMuted }}>
                  Fig. 7 -- The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div>
                <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(1) }}>
                  Label -- 11/16 -- Section Markers
                </p>
                <p style={{ ...TYPE.label, fontFamily: FONT.body, margin: 0, color: C.textMuted }}>
                  01 &mdash; System Overview
                </p>
              </div>
            </div>
          </Grid>
        </Section>

        {/* DIVIDER */}
        <Section style={{ paddingTop: u(6) }}>
          <Grid>
            <Divider />
          </Grid>
        </Section>

        {/* FULL-WIDTH STATEMENT */}
        <Section style={{ paddingTop: u(6) }}>
          <Grid>
            <div style={{ gridColumn: 'span 3' }}>
              <h1
                style={{
                  ...TYPE.h1,
                  fontFamily: FONT.display,
                  margin: 0,
                  fontSize: 38,
                }}
              >
                The grid is not a limitation.
                <br />
                It is the structure that makes
                <br />
                freedom possible.
              </h1>
            </div>
            <div
              style={{
                gridColumn: 'span 1',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <p style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textSecondary }}>
                Every decision within the system -- type size, image placement, section height -- is
                made easier by the constraints the grid provides. Rhythm replaces randomness.
              </p>
            </div>
          </Grid>
        </Section>

        {/* DIVIDER */}
        <Section style={{ paddingTop: u(6) }}>
          <Grid>
            <ThinDivider />
          </Grid>
        </Section>

        {/* SYSTEM SPECS TABLE */}
        <Section style={{ paddingTop: u(3), paddingBottom: u(8) }}>
          <Grid>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.label, fontFamily: FONT.body, color: C.textMuted, margin: 0, marginBottom: u(2) }}>
                05 &mdash; System Config
              </p>
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              {[
                ['Base Unit', '8px', 'All measurements derive from this value'],
                ['Columns', '4', 'Consistent horizontal division'],
                ['Column Gutter', '24px', '3 base units between columns'],
                ['Outer Margin', '64px', '8 base units -- wider than gutters'],
                ['H1 Line Height', '40px', '5 base units'],
                ['H2 Line Height', '24px', '3 base units'],
                ['Body Line Height', '20px', '2.5 base units'],
                ['Caption Line Height', '16px', '2 base units'],
                ['Section Ratio', '16:9', 'Proportional content modules'],
              ].map(([prop, value, note], i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 80px 1fr',
                    gap: CONFIG.columnGap,
                    paddingTop: u(1),
                    paddingBottom: u(1),
                    borderBottom: `1px solid ${C.dividerSubtle}`,
                  }}
                >
                  <span style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, fontWeight: 500 }}>{prop}</span>
                  <span style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {value}
                  </span>
                  <span style={{ ...TYPE.body, fontFamily: FONT.body, margin: 0, color: C.textMuted }}>{note}</span>
                </div>
              ))}
            </div>
          </Grid>
        </Section>

        {/* FOOTER */}
        <Section
          style={{
            paddingTop: u(3),
            paddingBottom: u(3),
            borderTop: `1px solid ${C.divider}`,
          }}
        >
          <Grid>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, margin: 0 }}>
                Modular Grid System v1.0
              </p>
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, margin: 0 }}>
                Base Unit: {UNIT}px
              </p>
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, margin: 0 }}>
                Columns: {CONFIG.columns} &mdash; Gutter: {CONFIG.columnGap}px
              </p>
            </div>
            <div style={{ gridColumn: 'span 1', textAlign: 'right' }}>
              <p style={{ ...TYPE.caption, fontFamily: FONT.body, color: C.textMuted, margin: 0 }}>
                Margin: {CONFIG.outerMargin}px
              </p>
            </div>
          </Grid>
        </Section>
      </div>
    </div>
  )
}
