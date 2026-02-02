import { useState, useEffect, useCallback, useRef } from 'react'
import { useSpring, animated } from '@react-spring/web'

const ActivityRingWidget = () => {
  const [loadKey, setLoadKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const getRandomValues = useCallback(() => {
    const data = []
    for (let i = 0; i < 7; i++) {
      data.push({
        day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i],
        value: Math.floor(Math.random() * 60) + 20
      })
    }
    const avg = Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length)
    return { data, avg }
  }, [])

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
    to: { value: isLoaded ? values.avg : 0 },
    delay: 300,
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
        marginBottom: '8px',
        ...headerSpring,
        transform: headerSpring.y.to(y => `translateY(${y}px)`)
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          color: 'white'
        }}>ACTIVITY</span>
        <span style={{
          fontSize: '10px',
          fontWeight: '600',
          background: '#ff6b4a',
          padding: '4px 10px',
          borderRadius: '12px',
          color: '#1a1a1a'
        }}>This Week</span>
      </animated.div>

      {/* Big Stat */}
      <animated.div style={{
        marginBottom: '12px',
        ...headerSpring
      }}>
        <animated.span style={{
          fontSize: '48px',
          fontWeight: '800',
          color: 'white',
          lineHeight: 1
        }}>
          {statSpring.value.to(v => Math.round(v))}
        </animated.span>
        <span style={{
          fontSize: '14px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.5)',
          marginLeft: '4px'
        }}>avg</span>
      </animated.div>

      {/* Animated Chart */}
      <div style={{ flex: 1, minHeight: '100px', marginTop: 'auto' }}>
        <AnimatedChart data={values.data} isLoaded={isLoaded} />
      </div>
    </div>
  )
}

const AnimatedChart = ({ data, isLoaded }) => {
  const svgRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)

  const width = 200
  const height = 100
  const padding = { top: 10, right: 10, bottom: 20, left: 10 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate points
  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((d.value - 20) / 60) * chartHeight
  }))

  // Generate smooth curve path using cardinal spline
  const generateSmoothPath = (pts) => {
    if (pts.length < 2) return ''

    const tension = 0.3
    let path = `M ${pts[0].x} ${pts[0].y}`

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]

      const cp1x = p1.x + (p2.x - p0.x) * tension
      const cp1y = p1.y + (p2.y - p0.y) * tension
      const cp2x = p2.x - (p3.x - p1.x) * tension
      const cp2y = p2.y - (p3.y - p1.y) * tension

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }

    return path
  }

  // Generate area path (curve + bottom)
  const generateAreaPath = (pts) => {
    const curvePath = generateSmoothPath(pts)
    return `${curvePath} L ${pts[pts.length - 1].x} ${padding.top + chartHeight} L ${pts[0].x} ${padding.top + chartHeight} Z`
  }

  const linePath = generateSmoothPath(points)
  const areaPath = generateAreaPath(points)

  // Measure path length after render
  useEffect(() => {
    if (svgRef.current) {
      const path = svgRef.current.querySelector('.main-path')
      if (path) {
        setPathLength(path.getTotalLength())
      }
    }
  }, [data])

  // Animate the stroke drawing
  const lineSpring = useSpring({
    from: { dashOffset: pathLength || 500 },
    to: { dashOffset: isLoaded ? 0 : (pathLength || 500) },
    delay: 100,
    config: { tension: 50, friction: 20 }
  })

  // Animate the area fill
  const areaSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: isLoaded ? 1 : 0 },
    delay: 400,
    config: { tension: 100, friction: 20 }
  })

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b4a" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#ff6b4a" stopOpacity={0.05} />
        </linearGradient>
      </defs>

      {/* Area fill - fades in after line draws */}
      <animated.path
        d={areaPath}
        fill="url(#areaGradient)"
        style={{ opacity: areaSpring.opacity }}
      />

      {/* Animated line */}
      <animated.path
        className="main-path"
        d={linePath}
        fill="none"
        stroke="#ff6b4a"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={pathLength || 500}
        strokeDashoffset={lineSpring.dashOffset}
      />

      {/* Dots - appear as line passes through */}
      {points.map((pt, i) => (
        <AnimatedDot
          key={i}
          cx={pt.x}
          cy={pt.y}
          index={i}
          total={points.length}
          isLoaded={isLoaded}
        />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={points[i].x}
          y={height - 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="9"
          fontFamily="Inter, sans-serif"
        >
          {d.day}
        </text>
      ))}
    </svg>
  )
}

const AnimatedDot = ({ cx, cy, index, total, isLoaded }) => {
  // Stagger dots to appear as the line draws through
  const delay = 100 + (index / (total - 1)) * 600

  const spring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: {
      scale: isLoaded ? 1 : 0,
      opacity: isLoaded ? 1 : 0
    },
    delay,
    config: { tension: 300, friction: 15 }
  })

  return (
    <animated.circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#ff6b4a"
      stroke="#1a1a1a"
      strokeWidth={2}
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        transform: spring.scale.to(s => `scale(${s})`),
        opacity: spring.opacity
      }}
    />
  )
}

export default ActivityRingWidget
