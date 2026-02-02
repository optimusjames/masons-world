import CalendarWidget from './CalendarWidget'
import DashboardWidget from './DashboardWidget'
import AnalyticsWidget from './AnalyticsWidget'
import ProgressRingsWidget from './ProgressRingsWidget'
import ActivityRingWidget from './ActivityRingWidget'
import GoalsWidget from './GoalsWidget'

function App() {
  return (
    <>
      <div className="container">

        {/* Card 1: Festival Header */}
        <div className="card card-black tall">
          <div className="header-section">
            <h1>Widget<br/>Board<br/>2025</h1>
          </div>
        </div>

        {/* Card 2-3: Interactive Calendar Widget */}
        <div className="card card-black wide tall" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CalendarWidget />
        </div>

        {/* Card 4: Schedule */}
        <div className="card card-orange tall">
          <h1>Schedule</h1>
        </div>

        {/* Card 5: Widget Dashboard */}
        <div className="card card-black extra-tall">
          <DashboardWidget />
        </div>

        {/* Card 6: Activity Ring Widget */}
        <div className="card card-black tall">
          <ActivityRingWidget />
        </div>

        {/* Card 7: Launch Schedule */}
        <div className="card card-orange extra-tall">
          <div className="header-section">
            <h2>Launch<br/>Schedule</h2>
            <div className="small-text" style={{ marginTop: '16px' }}>
              <strong>AURORA v2.0</strong>
            </div>
            <div className="schedule">
              <div className="schedule-item"><span>FEB. 10</span><span>9:00AM</span></div>
              <div className="schedule-item"><span>FEB. 12</span><span>2:30PM</span></div>
              <div className="schedule-item"><span>FEB. 11</span><span>11:00AM</span></div>
              <div className="schedule-item"><span>FEB. 14</span><span>6:00PM</span></div>
              <div className="schedule-item"><span>FEB. 11</span><span>4:15PM</span></div>
              <div className="schedule-item"><span>FEB. 16</span><span>10:00AM</span></div>
            </div>
            <div className="divider"></div>
            <div className="small-text" style={{ marginTop: '12px' }}>
              <strong>PRISM BETA</strong>
            </div>
            <div className="schedule">
              <div className="schedule-item"><span>FEB. 10</span><span>1:00PM</span></div>
              <div className="schedule-item"><span>FEB. 13</span><span>3:00PM</span></div>
              <div className="schedule-item"><span>FEB. 11</span><span>9:30AM</span></div>
              <div className="schedule-item"><span>FEB. 15</span><span>7:30PM</span></div>
              <div className="schedule-item"><span>FEB. 12</span><span>12:00PM</span></div>
              <div className="schedule-item"><span>FEB. 17</span><span>11:00AM</span></div>
            </div>
            <div className="divider"></div>
            <div className="small-text" style={{ marginTop: '12px' }}>
              <strong>NEBULA SDK</strong>
            </div>
            <div className="schedule">
              <div className="schedule-item"><span>FEB. 09</span><span>6:00PM</span></div>
              <div className="schedule-item"><span>FEB. 13</span><span>4:00PM</span></div>
              <div className="schedule-item"><span>FEB. 10</span><span>2:30PM</span></div>
              <div className="schedule-item"><span>FEB. 15</span><span>8:00PM</span></div>
            </div>
          </div>
          <div className="footer-section">
            <h2 style={{ marginTop: '20px' }}>Release<br/>Schedule</h2>
          </div>
        </div>

        {/* Card 8: Goals Widget */}
        <div className="card card-orange tall">
          <GoalsWidget />
        </div>

        {/* Card 9: Analytics Widget */}
        <div className="card card-orange tall">
          <AnalyticsWidget />
        </div>

        {/* Card 10: Progress Rings Widget */}
        <div className="card card-black tall">
          <ProgressRingsWidget />
        </div>

        {/* Card 11: Featured Component */}
        <div className="card card-dark-gray tall">
          <div className="badge" style={{ background: 'white', color: '#1a1a1a' }}>FEATURED COMPONENT</div>
          <h3 style={{ marginTop: 'auto' }}>Component<br/>Library</h3>
        </div>

        {/* Card 12: Infinite Canvas */}
        <div className="card card-orange tall">
          <h1>Infinite<br/>Canvas</h1>
        </div>

        {/* Card 13: Event Details */}
        <div className="card card-black tall">
          <div className="header-section">
            <div className="small-text">February 2 2025</div>
            <h2 style={{ marginTop: '8px' }}>3:15 PM</h2>
            <div className="subtitle">Widget Board HQ<br/>San Francisco, CA</div>
          </div>
          <div className="qr-placeholder">
            <div style={{ width: '60px', height: '60px', background: 'white' }}></div>
          </div>
          <div className="small-text" style={{ marginTop: '12px' }}>
            DEVELOPER ACCESS /<br/>
            CONTRIBUTOR LICENSE /<br/>
            ENTERPRISE TIER
          </div>
        </div>

        {/* Card 14: Design System Info */}
        <div className="card card-orange">
          <div className="small-text">
            <strong>DESIGN SYSTEM</strong><br/>
            STUDIO WIDGET
          </div>
        </div>

      </div>

      {/* Design Rationale Section */}
      <div style={{
        maxWidth: '100%',
        margin: '80px 0 0',
        padding: '60px 40px',
        background: 'white',
        color: '#1a1a1a'
      }}>

        {/* Heavy Top Rule */}
        <div style={{
          height: '8px',
          background: '#1a1a1a',
          marginBottom: '60px'
        }}></div>

        {/* Main Grid */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '60px'
        }}>

          {/* Left Column: Header */}
          <div>
            <h2 style={{
              fontSize: '72px',
              fontWeight: '800',
              lineHeight: 0.9,
              letterSpacing: '-0.02em'
            }}>Design<br/>Rationale</h2>
          </div>

          {/* Right Column: Running Text */}
          <div>

            {/* Section 1 */}
            <div style={{ marginBottom: '50px' }}>
              <div style={{ height: '2px', background: '#1a1a1a', marginBottom: '20px' }}></div>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>Color System</h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, fontWeight: '400' }}>
                Bold, high-contrast palette built on three core colors: vibrant orange-coral (#ff6b4a), deep black (#1a1a1a), and electric lime (#ff6b4a). This creates immediate visual hierarchy and energy while maintaining professional readability. Gray tones provide neutral balance for complex information displays.
              </p>
            </div>

            {/* Section 2 */}
            <div style={{ marginBottom: '50px' }}>
              <div style={{ height: '2px', background: '#1a1a1a', marginBottom: '20px' }}></div>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>Typography</h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, fontWeight: '400' }}>
                Inter font family delivers clean, modern aesthetics with excellent readability. Heavy weights (700-800) paired with tight line-height (0.95-1.1) create impactful headlines. Negative letter-spacing enhances density. Small text maintains legibility through careful size hierarchy (11-14px).
              </p>
            </div>

            {/* Section 3 */}
            <div style={{ marginBottom: '50px' }}>
              <div style={{ height: '2px', background: '#1a1a1a', marginBottom: '20px' }}></div>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>Layout Philosophy</h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, fontWeight: '400' }}>
                CSS Grid enables flexible card-based composition where each element can span multiple columns/rows. Variable card sizes create visual rhythm and information hierarchy. 16-20px gaps provide breathing room while maintaining density. Rounded corners (16-20px) soften the geometric precision.
              </p>
            </div>

            {/* Section 4 */}
            <div style={{ marginBottom: '50px' }}>
              <div style={{ height: '2px', background: '#1a1a1a', marginBottom: '20px' }}></div>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>LCD Widget Aesthetic</h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, fontWeight: '400' }}>
                Gradient gray backgrounds (#b8b8b8 to #d4d4d4) with subtle inset shadows evoke e-ink and LCD displays. Black text on gray creates the nostalgic digital readout feel. Progress bars, tabular numbers, and clean data visualization reference fitness trackers and smartwatch interfaces.
              </p>
            </div>

            {/* Section 5 */}
            <div style={{ marginBottom: '50px' }}>
              <div style={{ height: '2px', background: '#1a1a1a', marginBottom: '20px' }}></div>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>Information Density</h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, fontWeight: '400' }}>
                Strategic contrast between sparse, bold statement cards and dense schedule/data cards. Some cards feature single large headlines, others pack detailed schedules and metrics. This variation maintains engagement while serving different content purposes.
              </p>
            </div>

            {/* Section 6 */}
            <div style={{ marginBottom: '50px' }}>
              <div style={{ height: '2px', background: '#1a1a1a', marginBottom: '20px' }}></div>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>Component Modularity</h3>
              <p style={{ fontSize: '16px', lineHeight: 1.6, fontWeight: '400' }}>
                Self-contained widget components (calendar, metrics dashboard, schedules) can be composed, rearranged, and scaled. Each maintains consistent internal design language while offering distinct functionality. Badges, progress bars, and circular indicators create visual cohesion.
              </p>
            </div>

            {/* Heavy Rule Before Identity */}
            <div style={{ height: '4px', background: '#1a1a1a', margin: '60px 0 40px' }}></div>

            {/* Design Identity */}
            <div style={{ marginBottom: '50px' }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>Design Identity</h3>
              <p style={{ fontSize: '18px', lineHeight: 1.7, fontWeight: '400' }}>
                This system combines festival poster boldness with digital interface precision. It draws from contemporary event branding (Sundance, SXSW) while incorporating smartwatch/fitness app UI patterns. The result is energetic yet organized, expressive yet functional—perfect for communicating dense event information with personality and clarity.
              </p>
            </div>

            {/* System Name */}
            <div style={{
              borderLeft: '8px solid #ff6b4a',
              paddingLeft: '24px',
              marginTop: '50px'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
                opacity: 0.6
              }}>Design System</p>
              <h4 style={{
                fontSize: '32px',
                fontWeight: '800',
                lineHeight: 1.1,
                marginBottom: '12px'
              }}>"Widget Board"</h4>
              <p style={{ fontSize: '16px', lineHeight: 1.6, fontWeight: '400' }}>
                Bridging modular component design with digital interface precision.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom Heavy Rule */}
        <div style={{ height: '8px', background: '#1a1a1a', marginTop: '80px' }}></div>

      </div>
    </>
  )
}

export default App
