'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  motion,
  useSpring,
  useTransform,
  useAnimationControls,
  useReducedMotion,
} from 'motion/react'
import styles from './LiveData.module.css'

// Curated list, Portland first. All free / keyless via Open-Meteo.
const CITIES = [
  { name: 'Portland, OR', lat: 45.52, lon: -122.68 },
  { name: 'Seattle, WA', lat: 47.61, lon: -122.33 },
  { name: 'San Francisco, CA', lat: 37.77, lon: -122.42 },
  { name: 'Denver, CO', lat: 39.74, lon: -104.99 },
  { name: 'Austin, TX', lat: 30.27, lon: -97.74 },
  { name: 'Chicago, IL', lat: 41.88, lon: -87.63 },
  { name: 'New York, NY', lat: 40.71, lon: -74.01 },
  { name: 'Vancouver, BC', lat: 49.28, lon: -123.12 },
  { name: 'Minneapolis, MN', lat: 44.98, lon: -93.27 },
  { name: 'Los Angeles, CA', lat: 34.05, lon: -118.24 },
]

function weatherLabel(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: '☀️', label: 'Clear' }
  if (code === 1) return { icon: '🌤️', label: 'Mainly clear' }
  if (code === 2) return { icon: '⛅', label: 'Partly cloudy' }
  if (code === 3) return { icon: '☁️', label: 'Overcast' }
  if (code === 45 || code === 48) return { icon: '🌫️', label: 'Fog' }
  if (code >= 51 && code <= 57) return { icon: '🌦️', label: 'Drizzle' }
  if (code >= 61 && code <= 67) return { icon: '🌧️', label: 'Rain' }
  if (code >= 71 && code <= 77) return { icon: '🌨️', label: 'Snow' }
  if (code >= 80 && code <= 82) return { icon: '🌦️', label: 'Showers' }
  if (code >= 85 && code <= 86) return { icon: '🌨️', label: 'Snow showers' }
  if (code >= 95) return { icon: '⛈️', label: 'Thunderstorm' }
  return { icon: '·', label: '—' }
}

function aqiLevel(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: 'Good', color: '#4ccf7a' }
  if (aqi <= 100) return { label: 'Moderate', color: '#e8c95a' }
  if (aqi <= 150) return { label: 'Mildly unhealthy', color: '#e8965a' }
  if (aqi <= 200) return { label: 'Unhealthy', color: '#e85a5a' }
  if (aqi <= 300) return { label: 'Very unhealthy', color: '#b45ae8' }
  return { label: 'Hazardous', color: '#a33' }
}

// A number that springs from its previous value to the new one, with a slight
// overshoot so it reads as a physical settle. Falls back to a plain value when
// the user prefers reduced motion.
function AnimatedNumber({
  value,
  format,
  className,
  style,
}: {
  value: number
  format: (n: number) => string
  className?: string
  style?: React.CSSProperties
}) {
  const reduce = useReducedMotion()
  const spring = useSpring(0, { stiffness: 110, damping: 12, mass: 1 })
  const text = useTransform(spring, (v) => format(Math.round(v)))

  useEffect(() => {
    if (!reduce) spring.set(value)
  }, [value, spring, reduce])

  if (reduce) {
    return (
      <span className={className} style={style}>
        {format(value)}
      </span>
    )
  }
  return (
    <motion.span className={className} style={style}>
      {text}
    </motion.span>
  )
}

type Reading = { name: string; temp: number; code: number; aqi: number | null }

export default function LiveData() {
  const [index, setIndex] = useState(0)
  const [reading, setReading] = useState<Reading | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const reduce = useReducedMotion()
  const controls = useAnimationControls()
  const hadReading = useRef(false)

  const load = useCallback(async (idx: number) => {
    setStatus('loading')
    const c = CITIES[idx]
    try {
      const [wRes, aRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`,
        ),
        fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${c.lat}&longitude=${c.lon}&current=us_aqi`,
        ),
      ])
      if (!wRes.ok) throw new Error('weather')
      const w = await wRes.json()
      let aqi: number | null = null
      if (aRes.ok) {
        const a = await aRes.json()
        if (a?.current?.us_aqi != null) aqi = Math.round(a.current.us_aqi)
      }
      setReading({ name: c.name, temp: Math.round(w.current.temperature_2m), code: w.current.weather_code, aqi })
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load(index)
  }, [index, load])

  // Blur-morph pop, back half: when a fresh reading lands (name + numbers swap
  // to the new city at this instant), spring the readout back to sharp and
  // full-size. The numbers count up underneath at the same time.
  useEffect(() => {
    if (!reading || reduce) return
    // First reading ever isn't preceded by a click, so stage the blurred state
    // ourselves before popping in. Later readings were already blurred out by
    // the click handler, so we just spring back from wherever it is.
    if (!hadReading.current) {
      hadReading.current = true
      controls.set({ filter: 'blur(7px)', scale: 0.93, opacity: 0.35 })
    }
    controls.start({
      filter: 'blur(0px)',
      scale: 1,
      opacity: 1,
      transition: {
        scale: { type: 'spring', stiffness: 300, damping: 18 },
        filter: { duration: 0.45, ease: 'easeOut' },
        opacity: { duration: 0.3, ease: 'easeOut' },
      },
    })
  }, [reading, reduce, controls])

  // If a fetch fails, don't leave the readout stuck in the blurred-out state.
  useEffect(() => {
    if (status === 'error' && !reduce) {
      controls.start({
        filter: 'blur(0px)',
        scale: 1,
        opacity: 1,
        transition: { duration: 0.25, ease: 'easeOut' },
      })
    }
  }, [status, reduce, controls])

  const shuffle = () => {
    // Blur-morph pop, front half: blur out immediately on click for instant
    // feedback. The fetch runs under cover of this, and the data swaps at the
    // trough before the blur-in effect springs it back.
    if (!reduce) {
      controls.start({
        filter: 'blur(7px)',
        scale: 0.93,
        opacity: 0.35,
        transition: { duration: 0.2, ease: 'easeIn' },
      })
    }
    setIndex((prev) => {
      let n = prev
      while (n === prev) n = Math.floor(Math.random() * CITIES.length)
      return n
    })
  }

  // Never show a broken widget: if the fetch fails and we have nothing, hide it.
  if (status === 'error' && !reading) return null

  // Name follows the loaded reading, not the click, so it swaps in step with
  // the numbers and the morph. Falls back to the index only for first paint.
  const displayName = reading ? reading.name : CITIES[index].name
  const weather = reading ? weatherLabel(reading.code) : null
  const aqi = reading && reading.aqi != null ? aqiLevel(reading.aqi) : null

  return (
    <button
      type="button"
      className={styles.feed}
      onClick={shuffle}
      aria-label={`${displayName}. Weather and air quality. Click for a random city.`}
      title="Random city"
    >
      <motion.span className={styles.stack} animate={controls}>
        <span className={styles.city}>{displayName}</span>
        <span className={styles.readout}>
          <span className={styles.weather}>
            <span className={styles.wicon}>{weather?.icon ?? '·'}</span>
            {reading ? (
              <AnimatedNumber
                className={styles.temp}
                value={reading.temp}
                format={(n) => `${n}°`}
              />
            ) : (
              <span className={styles.temp}>—</span>
            )}
          </span>
          <span className={styles.aqi}>
            <span
              className={styles.dot}
              style={{ background: aqi?.color ?? 'rgba(255,255,255,0.22)', color: aqi?.color ?? 'transparent' }}
            />
            {reading && reading.aqi != null ? (
              <AnimatedNumber
                className={styles.aqiNum}
                style={{ color: aqi?.color ?? 'rgba(255,255,255,0.5)' }}
                value={reading.aqi}
                format={(n) => `${n}`}
              />
            ) : (
              <span className={styles.aqiNum} style={{ color: 'rgba(255,255,255,0.5)' }}>
                —
              </span>
            )}
            <span className={styles.aqiLabel}>{aqi?.label ?? 'AQI'}</span>
          </span>
        </span>
      </motion.span>
    </button>
  )
}
