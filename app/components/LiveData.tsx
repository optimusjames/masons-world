'use client'

import { useState, useEffect, useCallback } from 'react'
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
  if (aqi <= 150) return { label: 'Unhealthy (SG)', color: '#e8965a' }
  if (aqi <= 200) return { label: 'Unhealthy', color: '#e85a5a' }
  if (aqi <= 300) return { label: 'Very unhealthy', color: '#b45ae8' }
  return { label: 'Hazardous', color: '#a33' }
}

type Reading = { temp: number; code: number; aqi: number | null }

export default function LiveData() {
  const [index, setIndex] = useState(0)
  const [reading, setReading] = useState<Reading | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

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
      setReading({ temp: Math.round(w.current.temperature_2m), code: w.current.weather_code, aqi })
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load(index)
  }, [index, load])

  const shuffle = () => {
    setIndex((prev) => {
      let n = prev
      while (n === prev) n = Math.floor(Math.random() * CITIES.length)
      return n
    })
  }

  // Never show a broken widget: if the fetch fails and we have nothing, hide it.
  if (status === 'error' && !reading) return null

  const city = CITIES[index]
  const weather = reading ? weatherLabel(reading.code) : null
  const aqi = reading && reading.aqi != null ? aqiLevel(reading.aqi) : null

  return (
    <aside className={styles.card} aria-label="Live location readout">
      <div className={styles.head}>
        <span className={styles.city}>{city.name}</span>
        <button type="button" className={styles.shuffle} onClick={shuffle} aria-label="Random city" title="Random city">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h4l3 4m6-4h3m0 0l-2-2m2 2l-2 2M4 17h4l8-10h4m0 0l-2-2m2 2l-2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <span className={styles.coords}>{city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°</span>

      <div className={styles.weather}>
        <span className={styles.temp}>{reading ? `${reading.temp}°` : '—'}</span>
        <span className={styles.cond}>{weather ? `${weather.icon} ${weather.label}` : ' '}</span>
      </div>

      <div className={styles.aqi}>
        <span className={styles.dot} style={{ background: aqi?.color ?? 'rgba(255,255,255,0.2)' }} />
        <span>{aqi ? `AQI ${reading!.aqi} · ${aqi.label}` : 'AQI —'}</span>
      </div>

      <span className={styles.source}>live · open data</span>
    </aside>
  )
}
