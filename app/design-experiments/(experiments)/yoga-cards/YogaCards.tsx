'use client'

import { poses } from './data'
import YogaCard from './components/YogaCard'
import './styles.css'

export default function YogaCards() {
  return (
    <div className="yoga-cards">
      <header className="yoga-cards__header">
        <p className="yoga-cards__eyebrow">Design Experiment</p>
        <h1 className="yoga-cards__title">Yoga Cards</h1>
        <p className="yoga-cards__subtitle">
          Flippable pose cards. Tap to reveal details, share to link directly to any pose.
        </p>
      </header>

      <section className="yoga-cards__grid">
        {poses.map((pose, i) => (
          <YogaCard key={pose.id} pose={pose} index={i} />
        ))}
      </section>
    </div>
  )
}
