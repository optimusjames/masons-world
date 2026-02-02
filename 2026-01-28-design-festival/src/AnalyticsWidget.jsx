import { useState, useEffect, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/web'

const AnalyticsWidget = () => {
  const [loadKey, setLoadKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const dayLabels = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  const getRandomValues = useCallback(() => ({
    total: Math.floor(Math.random() * 5000) + 3000, // 3000-8000
    bars: dayLabels.map(() => Math.floor(Math.random() * 60) + 20) // 20-80%
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

  const numberSpring = useSpring({
    from: { scale: 0.5, opacity: 0 },
    to: { scale: isLoaded ? 1 : 0.5, opacity: isLoaded ? 1 : 0 },
    delay: 100,
    config: { tension: 180, friction: 15 }
  })

  const formatTotal = (num) => {
    if (num >= 1000) {
      return `${Math.round(num / 1000)}K+`
    }
    return num.toString()
  }

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
        marginBottom: '8px',
        ...headerSpring,
        transform: headerSpring.y.to(y => `translateY(${y}px)`)
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          color: '#1a1a1a'
        }}>ANALYTICS</span>
        <span style={{
          fontSize: '10px',
          fontWeight: '600',
          background: 'rgba(0,0,0,0.15)',
          padding: '4px 10px',
          borderRadius: '12px',
          color: '#1a1a1a'
        }}>This Week</span>
      </animated.div>

      {/* Big Number */}
      <animated.div style={{
        fontSize: '48px',
        fontWeight: '800',
        lineHeight: 1,
        color: '#1a1a1a',
        marginBottom: '16px',
        ...numberSpring,
        transform: numberSpring.scale.to(s => `scale(${s})`)
      }}>
        {isLoaded ? formatTotal(values.total) : '0K+'}
      </animated.div>

      {/* Bar Chart */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flex: 1,
        alignItems: 'flex-end',
        minHeight: '80px'
      }}>
        {values.bars.map((height, i) => (
          <BarColumn
            key={i}
            height={height}
            label={dayLabels[i]}
            delay={200 + i * 50}
            isLoaded={isLoaded}
          />
        ))}
      </div>
    </div>
  )
}

const BarColumn = ({ height, label, delay, isLoaded }) => {
  const barSpring = useSpring({
    from: { height: '0%' },
    to: { height: isLoaded ? `${height}%` : '0%' },
    delay,
    config: { tension: 120, friction: 14 }
  })

  const labelSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: isLoaded ? 0.7 : 0 },
    delay: delay + 100,
    config: { tension: 200, friction: 20 }
  })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      height: '100%'
    }}>
      {/* Bar container */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative'
      }}>
        <animated.div style={{
          width: '100%',
          borderRadius: '4px',
          background: 'linear-gradient(to top, #1a1a1a 50%, rgba(0,0,0,0.15) 50%)',
          ...barSpring
        }} />
      </div>
      {/* Day label */}
      <animated.span style={{
        fontSize: '9px',
        fontWeight: '600',
        color: '#1a1a1a',
        marginTop: '6px',
        ...labelSpring
      }}>{label}</animated.span>
    </div>
  )
}

export default AnalyticsWidget
