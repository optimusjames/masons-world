import { useState, useEffect, useCallback } from 'react'
import { useSpring, animated, config } from '@react-spring/web'

// Animated number that counts up
const AnimatedNumber = ({ value, delay = 0, decimals = 0, duration = 800 }) => {
  const spring = useSpring({
    from: { val: 0 },
    to: { val: value },
    delay,
    config: { duration }
  })

  return (
    <animated.span>
      {spring.val.to(v => decimals > 0 ? v.toFixed(decimals) : Math.round(v))}
    </animated.span>
  )
}

// Flip-style date animation (cycles through previous days)
const FlipDate = ({ targetDay, targetDayName, delay = 0 }) => {
  const [displayDay, setDisplayDay] = useState(targetDay - 3)
  const [displayName, setDisplayName] = useState('')

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  useEffect(() => {
    const startDay = targetDay - 3
    let current = startDay

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        current++
        if (current > targetDay) {
          clearInterval(interval)
          return
        }
        setDisplayDay(current)
        setDisplayName(dayNames[(dayNames.indexOf(targetDayName) - (targetDay - current) + 7) % 7])
      }, 120)

      return () => clearInterval(interval)
    }, delay)

    // Initial state
    setDisplayDay(startDay)
    setDisplayName(dayNames[(dayNames.indexOf(targetDayName) - 3 + 7) % 7])

    return () => clearTimeout(timeout)
  }, [targetDay, targetDayName, delay])

  const spring = useSpring({
    from: { scale: 0.8, opacity: 0.5 },
    to: { scale: 1, opacity: 1 },
    reset: true,
    config: { tension: 400, friction: 20 }
  })

  return (
    <animated.div style={spring}>
      <div style={{ fontSize: '32px', fontWeight: '700', lineHeight: 1 }}>{displayName}</div>
      <div style={{ fontSize: '32px', fontWeight: '700', lineHeight: 1 }}>{displayDay}</div>
    </animated.div>
  )
}

const DashboardWidget = ({ className = '' }) => {
  const [loadKey, setLoadKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Generate random but plausible values
  const getRandomValues = useCallback(() => ({
    temperature: Math.floor(Math.random() * 20) + 15, // 15-35
    speed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
    speedPercent: Math.floor(Math.random() * 40) + 40, // 40-80%
    timeHours: Math.floor(Math.random() * 2) + 1, // 1-2 hrs
    timeMinutes: Math.floor(Math.random() * 50) + 10, // 10-59 min
    timePercent: Math.floor(Math.random() * 40) + 30, // 30-70%
    distance: (Math.random() * 15 + 5).toFixed(3) // 5-20 km
  }), [])

  const [values, setValues] = useState(getRandomValues)

  // Get real time
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const isPM = hours >= 12
  const displayHours = hours % 12 || 12
  const timeString = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  // Get real date
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayName = dayNames[now.getDay()]
  const dayNumber = now.getDate()

  // Reload handler
  const handleReload = () => {
    setIsLoaded(false)
    setValues(getRandomValues())
    setLoadKey(k => k + 1)
    setTimeout(() => setIsLoaded(true), 100)
  }

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Animations
  const timeSpring = useSpring({
    from: { scale: 0.3, opacity: 0 },
    to: { scale: isLoaded ? 1 : 0.3, opacity: isLoaded ? 1 : 0 },
    delay: 0,
    config: { tension: 200, friction: 15 }
  })

  const ampmSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -10 },
    delay: 400,
    config: config.gentle
  })

  const tempSpring = useSpring({
    from: { scale: 0.5, rotate: -180 },
    to: { scale: isLoaded ? 1 : 0.5, rotate: isLoaded ? 0 : -180 },
    delay: 200,
    config: { tension: 180, friction: 12 }
  })

  const speedBarSpring = useSpring({
    from: { width: '0%' },
    to: { width: isLoaded ? `${values.speedPercent}%` : '0%' },
    delay: 500,
    config: { tension: 120, friction: 14 }
  })

  const timeBarSpring = useSpring({
    from: { width: '0%' },
    to: { width: isLoaded ? `${values.timePercent}%` : '0%' },
    delay: 650,
    config: { tension: 120, friction: 14 }
  })

  const distanceSpring = useSpring({
    from: { opacity: 0, x: 20 },
    to: { opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 20 },
    delay: 300,
    config: config.gentle
  })

  const arrowSpring = useSpring({
    from: { rotate: -90, opacity: 0 },
    to: { rotate: isLoaded ? 0 : -90, opacity: isLoaded ? 1 : 0 },
    delay: 400,
    config: { tension: 200, friction: 20 }
  })

  return (
    <div
      key={loadKey}
      className={className}
      onClick={handleReload}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'auto auto auto',
        gap: '10px',
        cursor: 'pointer',
        userSelect: 'none',
        flex: 1
      }}
    >
      {/* Time Widget */}
      <animated.div style={{
        background: '#5a5a5a',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gridColumn: 'span 2',
        ...timeSpring,
        transform: timeSpring.scale.to(s => `scale(${s})`)
      }}>
        <div style={{
          fontSize: '56px',
          fontWeight: '700',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums'
        }}>{timeString}</div>
        <animated.div style={{
          fontSize: '18px',
          fontWeight: '600',
          opacity: ampmSpring.opacity,
          marginTop: '4px',
          transform: ampmSpring.y.to(y => `translateY(${y}px)`)
        }}>{isPM ? 'PM' : 'AM'}</animated.div>
      </animated.div>

      {/* Date Widget */}
      <div style={{
        background: '#ff6b4a',
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#1a1a1a',
        overflow: 'hidden'
      }}>
        <FlipDate
          targetDay={dayNumber}
          targetDayName={dayName}
          delay={150}
        />
      </div>

      {/* Temperature Widget */}
      <animated.div style={{
        background: '#3a3a3a',
        borderRadius: '50%',
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: tempSpring.scale.to((s) =>
          `scale(${s}) rotate(${tempSpring.rotate.get()}deg)`
        )
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: '600',
          fontVariantNumeric: 'tabular-nums'
        }}>
          {isLoaded ? (
            <><AnimatedNumber value={values.temperature} delay={300} />°</>
          ) : '0°'}
        </div>
      </animated.div>

      {/* Stats Widget */}
      <div style={{
        background: '#5a5a5a',
        borderRadius: '14px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        gridColumn: 'span 2'
      }}>
        {/* Arrow Icon + Speed */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '6px'
        }}>
          <animated.div style={{
            background: '#2a2a2a',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            transform: arrowSpring.rotate.to(r => `rotate(${r}deg)`),
            opacity: arrowSpring.opacity
          }}>↗</animated.div>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '4px'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                opacity: 0.8
              }}>Speed</div>
              <div style={{
                fontSize: '10px',
                opacity: 0.6
              }}>
                {isLoaded ? (
                  <><AnimatedNumber value={values.speed} delay={500} />km/h</>
                ) : '0km/h'}
              </div>
            </div>
            <div style={{
              background: '#3a3a3a',
              height: '4px',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <animated.div style={{
                background: '#ff6b4a',
                height: '100%',
                ...speedBarSpring
              }} />
            </div>
          </div>
        </div>

        {/* Time Progress */}
        <div style={{ paddingLeft: '62px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '4px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              opacity: 0.8
            }}>Time</div>
            <div style={{
              fontSize: '10px',
              opacity: 0.6
            }}>
              {isLoaded ? (
                <>
                  <AnimatedNumber value={values.timeHours} delay={650} /> Hrs{' '}
                  <AnimatedNumber value={values.timeMinutes} delay={700} /> Min
                </>
              ) : '0 Hrs 0 Min'}
            </div>
          </div>
          <div style={{
            background: '#3a3a3a',
            height: '4px',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <animated.div style={{
              background: '#ff6b4a',
              height: '100%',
              ...timeBarSpring
            }} />
          </div>
        </div>

        {/* Distance Display */}
        <animated.div style={{
          background: '#6a6a6a',
          borderRadius: '12px',
          padding: '12px 16px',
          marginTop: '4px',
          textAlign: 'right',
          ...distanceSpring,
          transform: distanceSpring.x.to(x => `translateX(${x}px)`)
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums'
          }}>
            {isLoaded ? (
              <AnimatedNumber value={parseFloat(values.distance)} delay={400} decimals={3} duration={1200} />
            ) : '0.000'}
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            opacity: 0.7,
            marginTop: '2px'
          }}>km</div>
        </animated.div>
      </div>
    </div>
  )
}

export default DashboardWidget
