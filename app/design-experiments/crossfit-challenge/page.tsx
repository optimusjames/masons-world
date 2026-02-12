'use client'

import { useState } from 'react'
import { designers } from './data/designers'
import DesignBrutal from './components/DesignBrutal'
import DesignMinimal from './components/DesignMinimal'
import DesignEditorial from './components/DesignEditorial'
import DesignTechData from './components/DesignTechData'
import './styles.css'

const designComponents: Record<string, React.ComponentType> = {
  brutal: DesignBrutal,
  minimal: DesignMinimal,
  editorial: DesignEditorial,
  'tech-data': DesignTechData,
}

export default function CrossFitChallenge() {
  const [selected, setSelected] = useState<string | null>(null)

  if (selected) {
    const DesignComponent = designComponents[selected]
    return (
      <div className="fullpage-overlay">
        <button className="back-button" onClick={() => setSelected(null)}>
          Back to Gallery
        </button>
        <div className="fullpage-content">
          <DesignComponent />
        </div>
      </div>
    )
  }

  return (
    <div className="showcase">
      <div className="showcase-header">
        <h1>CrossFit Design Challenge</h1>
        <p>Four agentic designers, one brief. Click to view each approach.</p>
      </div>
      <div className="gallery-grid">
        {designers.map((designer) => {
          const DesignComponent = designComponents[designer.id]
          return (
            <div
              key={designer.id}
              className="gallery-card"
              style={{ '--accent': designer.accent } as React.CSSProperties}
              onClick={() => setSelected(designer.id)}
            >
              <div className="card-preview">
                <div className="card-preview-inner">
                  <DesignComponent />
                </div>
              </div>
              <div className="card-info">
                <h3>{designer.name}</h3>
                <span className="card-subtitle">Agentic Designer</span>
                <div className="card-tags">
                  {designer.tags.map((tag) => (
                    <span key={tag} className="card-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <article className="story">
        <div className="story-inner">
          <h2 className="story-heading">How This Was Made</h2>

          <div className="story-body">
            <p>
              This experiment started with a question: what happens when you give four autonomous AI agents the same design brief and let them work independently?
            </p>

            <p>
              The brief was simple -- build a homepage for IRON REPUBLIC, a fictional CrossFit gym in Austin, TX. Same content, same sections, same constraints. The only variable was the designer.
            </p>

            <h3>Phase 1: Agentic Design</h3>
            <p>
              Using Claude Code's agent teams, we spun up four parallel agents, each assigned a designer persona with a distinct aesthetic point of view. Marcus Voss went dark and industrial. Elise Nakamura pursued minimalist restraint. Sofia Reyes took an editorial, magazine-inspired direction. James Chen built a data-forward dashboard experience.
            </p>
            <p>
              Each agent worked autonomously -- choosing fonts, writing CSS, structuring components, and making design decisions without any human input. A lead agent coordinated the team, ensuring each designer stayed in their lane and delivered a complete, buildable page. The four designs you see above are the direct output of that first pass.
            </p>

            <h3>Phase 2: Human in the Loop</h3>
            <p>
              After the initial agentic pass, the designs were refined through conversation. Subtle typography adjustments, font experiments with Geist Pixel variants, and the addition of real CrossFit photography to replace placeholder gradients. This was a collaborative back-and-forth -- reviewing in the browser, discussing what worked and what didn't, and iterating together.
            </p>

            <h3>The Process</h3>
            <p>
              The entire project was built in Claude Code. No IDE was opened at any point. No manual file editing, no copy-pasting between tools. From the initial agent team setup through the final image placement and typography refinements, every change was made through conversation. The build succeeded on every iteration with zero errors.
            </p>
            <p>
              What's interesting isn't that AI can write code -- it's the workflow. Agent teams handle the divergent, exploratory work. Human-AI collaboration handles the convergent, taste-driven refinement. Both phases matter, and the boundary between them is more fluid than you'd expect.
            </p>
          </div>
        </div>
      </article>
    </div>
  )
}
