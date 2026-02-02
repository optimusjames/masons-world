import { useState, useEffect, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/web'

const GoalsWidget = () => {
  const [loadKey, setLoadKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const getRandomValues = useCallback(() => ({
    change: Math.floor(Math.random() * 21) + 5, // 5-25%
    bars: [
      { label: 'This Week', percent: Math.floor(Math.random() * 51) + 40 },   // 40-90%
      { label: 'This Month', percent: Math.floor(Math.random() * 51) + 30 },  // 30-80%
      { label: 'This Year', percent: Math.floor(Math.random() * 51) + 20 }    // 20-70%
    ]
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

  const statSpring = useSpring({
    from: { value: 0 },
    to: { value: isLoaded ? values.change : 0 },
    delay: 100,
    config: { tension: 120, friction: 20 }
  })

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
        alignItems: 'flex-start',
        marginBottom: '24px',
        ...headerSpring,
        transform: headerSpring.y.to(y => `translateY(${y}px)`)
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          color: '#1a1a1a'
        }}>GOALS</span>
        <animated.span style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1a1a1a',
          lineHeight: 1
        }}>
          {statSpring.value.to(v => `+${Math.round(v)}%`)}
        </animated.span>
      </animated.div>

      {/* Progress Bars */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginTop: 'auto'
      }}>
        {values.bars.map((bar, i) => (
          <ProgressBar
            key={i}
            label={bar.label}
            percent={bar.percent}
            delay={200 + i * 100}
            isLoaded={isLoaded}
          />
        ))}
      </div>
    </div>
  )
}

const ProgressBar = ({ label, percent, delay, isLoaded }) => {
  const labelSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: isLoaded ? 1 : 0 },
    delay,
    config: { tension: 200, friction: 20 }
  })

  const barSpring = useSpring({
    from: { width: 0 },
    to: { width: isLoaded ? percent : 0 },
    delay: delay + 50,
    config: { tension: 100, friction: 20 }
  })

  return (
    <div>
      <animated.div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px',
        ...labelSpring
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: '#1a1a1a'
        }}>{label}</span>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#1a1a1a'
        }}>{percent}%</span>
      </animated.div>
      <div style={{
        height: '8px',
        background: 'rgba(0,0,0,0.15)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <animated.div style={{
          height: '100%',
          background: '#1a1a1a',
          borderRadius: '4px',
          width: barSpring.width.to(w => `${w}%`)
        }} />
      </div>
    </div>
  )
}

export default GoalsWidget
