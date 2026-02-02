import { useState, useEffect, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/web'

const ProgressRingsWidget = () => {
  const [loadKey, setLoadKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Orange/gray theme to match the design system
  const ringConfig = [
    { label: 'Frontend', color: '#ff6b4a' },  // Primary orange
    { label: 'Backend', color: '#ff8a6a' },   // Lighter orange
    { label: 'DevOps', color: '#8a8a8a' },    // Gray
    { label: 'Testing', color: '#5a5a5a' }    // Darker gray
  ]

  const getRandomValues = useCallback(() => ({
    overall: Math.floor(Math.random() * 35) + 50, // 50-85%
    rings: ringConfig.map(r => ({
      ...r,
      percent: Math.floor(Math.random() * 50) + 20 // 20-70%
    }))
  }), [])

  const [values, setValues] = useState(getRandomValues)

  const handleReload = () => {
    setIsLoaded(false)
    setValues(getRandomValues())
    setLoadKey(k => k + 1)
    setTimeout(() => setIsLoaded(true), 100)
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -10 },
    delay: 0,
    config: { tension: 200, friction: 20 }
  })

  const centerSpring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: isLoaded ? 1 : 0, opacity: isLoaded ? 1 : 0 },
    delay: 300,
    config: { tension: 180, friction: 15 }
  })

  // SVG ring parameters - larger size to fill more of the card
  const size = 180
  const center = size / 2
  const strokeWidth = 12
  const gap = 14

  return (
    <div
      key={loadKey}
      onClick={handleReload}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {/* Header */}
      <animated.div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        ...headerSpring,
        transform: headerSpring.y.to(y => `translateY(${y}px)`)
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          color: 'white'
        }}>PROGRESS</span>
        <span style={{
          fontSize: '10px',
          fontWeight: '600',
          background: '#ff6b4a',
          padding: '4px 10px',
          borderRadius: '12px',
          color: '#1a1a1a'
        }}>See All</span>
      </animated.div>

      {/* Rings Container */}
      <div style={{
        position: 'relative',
        width: size,
        height: size,
        margin: '0 auto 8px'
      }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {values.rings.map((ring, i) => {
            const radius = center - strokeWidth / 2 - i * gap
            return (
              <Ring
                key={i}
                cx={center}
                cy={center}
                radius={radius}
                percent={ring.percent}
                color={ring.color}
                strokeWidth={strokeWidth}
                delay={100 + i * 100}
                isLoaded={isLoaded}
              />
            )
          })}
        </svg>

        {/* Center Percentage */}
        <animated.div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: centerSpring.scale.to(s => `translate(-50%, -50%) scale(${s})`),
          opacity: centerSpring.opacity,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '38px',
            fontWeight: '800',
            color: 'white',
            lineHeight: 1
          }}>
            {isLoaded ? values.overall : 0}%
          </div>
        </animated.div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginTop: 'auto'
      }}>
        {values.rings.map((ring, i) => (
          <LegendItem
            key={i}
            label={ring.label}
            percent={ring.percent}
            color={ring.color}
            delay={400 + i * 80}
            isLoaded={isLoaded}
          />
        ))}
      </div>
    </div>
  )
}

const Ring = ({ cx, cy, radius, percent, color, strokeWidth, delay, isLoaded }) => {
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  const spring = useSpring({
    from: { dashOffset: circumference },
    to: { dashOffset: isLoaded ? offset : circumference },
    delay,
    config: { tension: 80, friction: 20 }
  })

  return (
    <>
      {/* Background track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Animated arc */}
      <animated.circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={spring.dashOffset}
      />
    </>
  )
}

const LegendItem = ({ label, percent, color, delay, isLoaded }) => {
  const spring = useSpring({
    from: { opacity: 0, x: -10 },
    to: { opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -10 },
    delay,
    config: { tension: 200, friction: 20 }
  })

  return (
    <animated.div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      ...spring,
      transform: spring.x.to(x => `translateX(${x}px)`)
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color
      }} />
      <span style={{
        fontSize: '10px',
        color: 'rgba(255,255,255,0.7)',
        flex: 1
      }}>{label}</span>
      <span style={{
        fontSize: '10px',
        fontWeight: '600',
        color: 'white'
      }}>{isLoaded ? percent : 0}%</span>
    </animated.div>
  )
}

export default ProgressRingsWidget
