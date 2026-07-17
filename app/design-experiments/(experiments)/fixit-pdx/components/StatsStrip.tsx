'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform, useReducedMotion } from 'motion/react'
import styles from '../styles.module.css'

// A stat that springs from 0 up to its value — on first mount and again each
// time `replay` changes (i.e. when the card is clicked to recount).
function StatNumber({ value, replay }: { value: number; replay: number }) {
  const reduce = useReducedMotion()
  const spring = useSpring(0, { stiffness: 90, damping: 14, mass: 1 })
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (reduce) {
      spring.jump(value)
      return
    }
    spring.jump(0)
    const id = requestAnimationFrame(() => spring.set(value))
    return () => cancelAnimationFrame(id)
  }, [value, replay, spring, reduce])

  if (reduce) return <span className={styles.statNum}>{value.toLocaleString()}</span>
  return <motion.span className={styles.statNum}>{text}</motion.span>
}

export default function StatsStrip({
  reported,
  fixed,
}: {
  reported: number
  fixed: number
}) {
  const [replay, setReplay] = useState(0)
  return (
    <button
      type="button"
      className={styles.stats}
      onClick={() => setReplay((n) => n + 1)}
      aria-label="Recount this month's totals"
      title="Recount"
    >
      <span className={styles.stat}>
        <StatNumber value={reported} replay={replay} />
        <span className={styles.statLabel}>reported this month</span>
      </span>
      <span className={styles.statDivider} />
      <span className={styles.stat}>
        <StatNumber value={fixed} replay={replay} />
        <span className={styles.statLabel}>fixed this month</span>
      </span>
    </button>
  )
}
