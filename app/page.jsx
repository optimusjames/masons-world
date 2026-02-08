'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  const canvasRef = useRef(null)
  const video1Ref = useRef(null)
  const video2Ref = useRef(null)
  const videoOverlayRef = useRef(null)
  const activeVideoRef = useRef(1)
  const isSwappedRef = useRef(false)
  const isTransitioningRef = useRef(false)

  useEffect(() => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current
    const videoOverlay = videoOverlayRef.current

    function handleVideoClick() {
      if (isSwappedRef.current || isTransitioningRef.current) return

      isTransitioningRef.current = true
      activeVideoRef.current = 2
      isSwappedRef.current = true

      videoOverlay.classList.add(styles.disabled)

      video1.classList.remove(styles.videoVisible)
      video1.classList.add(styles.videoHidden)
      video2.classList.remove(styles.videoHidden)
      video2.classList.add(styles.videoVisible)

      if (video2.readyState >= 2) {
        video2.currentTime = 0
        video2.play().then(() => {
          isTransitioningRef.current = false
        }).catch(() => {
          isTransitioningRef.current = false
        })
      } else {
        video2.addEventListener('canplay', () => {
          video2.currentTime = 0
          video2.play()
          isTransitioningRef.current = false
        }, { once: true })
      }
    }

    function handleVideo2Ended() {
      activeVideoRef.current = 1
      isSwappedRef.current = false

      video2.classList.remove(styles.videoVisible)
      video2.classList.add(styles.videoHidden)
      video1.classList.remove(styles.videoHidden)
      video1.classList.add(styles.videoVisible)

      videoOverlay.classList.remove(styles.disabled)

      video1.play().catch(() => {})
    }

    videoOverlay.addEventListener('click', handleVideoClick)
    video2.addEventListener('ended', handleVideo2Ended)

    video2.load()

    return () => {
      videoOverlay.removeEventListener('click', handleVideoClick)
      video2.removeEventListener('ended', handleVideo2Ended)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let animationFrameId
    let animations = []

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    function noise(x, y, seed = 0) {
      x = x * 0.01 + seed
      y = y * 0.01 + seed
      return (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1
    }

    window.addEventListener('resize', resize)
    resize()

    const organisms = []
    const NUM_ORGANISMS = 9
    const NODES_PER_ORGANISM = 57
    const CLUSTER_RADIUS = 500
    const rotationSpeed = 0.0001745

    const gridSize = Math.ceil(Math.sqrt(NUM_ORGANISMS))
    const cellWidth = width / gridSize
    const cellHeight = height / gridSize

    for (let i = 0; i < NUM_ORGANISMS; i++) {
      const gridX = i % gridSize
      const gridY = Math.floor(i / gridSize)
      const centerX = cellWidth * (gridX + 0.3 + Math.random() * 0.4)
      const centerY = cellHeight * (gridY + 0.3 + Math.random() * 0.4)

      const nodes = []
      for (let j = 0; j < NODES_PER_ORGANISM; j++) {
        const angle = Math.random() * 2 * Math.PI
        const radius = Math.random() * CLUSTER_RADIUS
        const baseX = radius * Math.cos(angle)
        const baseY = radius * Math.sin(angle)

        nodes.push({
          baseX,
          baseY,
          x: centerX + baseX,
          y: centerY + baseY,
          vx: 0,
          vy: 0,
          size: 1.5 + Math.random() * 2,
          noiseOffsetX: Math.random() * 2000,
          noiseOffsetY: Math.random() * 2000,
          mass: 2.0,
          affectedByBlast: false,
          lastBlastTime: 0,
          recoveryDelay: 33 + Math.random() * 133
        })
      }

      const connections = []
      for (let k = 0; k < nodes.length; k++) {
        for (let l = k + 1; l < nodes.length; l++) {
          if (Math.random() < 0.2) connections.push([k, l])
        }
      }

      organisms.push({
        centerX,
        centerY,
        baseX: centerX,
        baseY: centerY,
        nodes,
        vx: 0.1 * (Math.random() * 2 - 1),
        vy: 0.1 * (Math.random() * 2 - 1),
        connections,
        noiseSeed: Math.random() * 1000,
        lastNoiseChange: 0,
        noiseChangeInterval: 800 + Math.random() * 1000
      })
    }

    function handleClick(e) {
      animations.push({
        x: e.clientX,
        y: e.clientY,
        startTime: performance.now(),
        radius: 0,
        maxRadius: 437,
        duration: 1333,
        blastForce: 12.5,
        blastDelay: 125,
        blastSpeed: 0.85
      })
    }

    document.addEventListener('click', handleClick)

    let lastTime = 0
    let startTime = 0
    const MAX_DISTANCE = 190
    const EDGE_THRESHOLD = 10
    const fixedSpeed = 0.12

    function animate(timestamp) {
      if (startTime === 0) startTime = timestamp

      lastTime = timestamp

      const rotationAngle = (timestamp * rotationSpeed) % (Math.PI * 2)
      const centerX = width / 2
      const centerY = height / 2

      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, width, height)

      const interEdges = []

      for (const org of organisms) {
        if (timestamp - org.lastNoiseChange > org.noiseChangeInterval) {
          org.noiseSeed = Math.random() * 4000000
          org.lastNoiseChange = timestamp
          org.noiseChangeInterval = 5000 + Math.random() * 100000
        }

        const noiseX = noise(org.noiseSeed, timestamp * 0.0005 * fixedSpeed)
        const noiseY = noise(org.noiseSeed + 1000, timestamp * 0.0005 * fixedSpeed)
        const desiredVx = (noiseX * 2 - 1) * 1.5 * fixedSpeed
        const desiredVy = (noiseY * 2 - 1) * 1.5 * fixedSpeed

        org.vx += (desiredVx - org.vx) * 0.05
        org.vy += (desiredVy - org.vy) * 0.05

        if (Math.abs(org.vx) < 0.1) org.vx = org.vx < 0 ? -0.1 : 0.1
        if (Math.abs(org.vy) < 0.1) org.vy = org.vy < 0 ? -0.1 : 0.1

        const edgeBuffer = width * 0.3
        if (org.baseX < edgeBuffer) org.vx += 0.1 * fixedSpeed
        else if (org.baseX > width - edgeBuffer) org.vx -= 0.1 * fixedSpeed
        if (org.baseY < edgeBuffer) org.vy += 0.1 * fixedSpeed
        else if (org.baseY > height - edgeBuffer) org.vy -= 0.1 * fixedSpeed

        org.vx *= 0.98
        org.vy *= 0.98

        org.baseX += org.vx
        org.baseY += org.vy

        const padding = 100
        if (org.baseX < padding) {
          org.vx = Math.abs(org.vx) * 1.5
          org.baseX = padding
        } else if (org.baseX > width - padding) {
          org.vx = -Math.abs(org.vx) * 1.5
          org.baseX = width - padding
        }
        if (org.baseY < padding) {
          org.vy = Math.abs(org.vy) * 1.5
          org.baseY = padding
        } else if (org.baseY > height - padding) {
          org.vy = -Math.abs(org.vy) * 1.5
          org.baseY = height - padding
        }

        const vx = org.baseX - centerX
        const vy = org.baseY - centerY
        const distance = Math.sqrt(vx * vx + vy * vy)
        const currentAngle = Math.atan2(vy, vx)
        const newAngle = currentAngle + rotationAngle

        org.centerX = centerX + Math.cos(newAngle) * distance
        org.centerY = centerY + Math.sin(newAngle) * distance

        for (const node of org.nodes) {
          const nodeNoiseX = noise(node.noiseOffsetX + timestamp * 0.001 * fixedSpeed, 0)
          const nodeNoiseY = noise(node.noiseOffsetY + timestamp * 0.001 * fixedSpeed, 0)

          const targetX = org.centerX + node.baseX + (nodeNoiseX * 2 - 1) * 50
          const targetY = org.centerY + node.baseY + (nodeNoiseY * 2 - 1) * 50

          const timeSinceBlast = node.affectedByBlast ? timestamp - node.lastBlastTime : Infinity

          let springForce = 0.05
          let damping = 0.95

          if (timeSinceBlast < node.recoveryDelay) {
            const stunRecoveryFactor = timeSinceBlast / node.recoveryDelay
            springForce = springForce * stunRecoveryFactor * 0.6
            damping = 0.97

            if (timeSinceBlast >= node.recoveryDelay) {
              node.affectedByBlast = false
            }
          } else {
            const velocityMagnitude = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
            springForce = springForce * (1 + Math.min(2, velocityMagnitude / 5)) * 3.0
          }

          springForce = springForce / node.mass

          const dx = targetX - node.x
          const dy = targetY - node.y
          const distanceFromTarget = Math.sqrt(dx * dx + dy * dy)

          if (distanceFromTarget > 0) {
            const recoveryMultiplier = Math.min(3, Math.max(1, distanceFromTarget / 100))
            node.vx += (dx / distanceFromTarget) * springForce * recoveryMultiplier
            node.vy += (dy / distanceFromTarget) * springForce * recoveryMultiplier
          }

          node.vx *= damping
          node.vy *= damping
          node.x += node.vx
          node.y += node.vy
        }

        ctx.strokeStyle = "#8FD0FFFF"
        ctx.lineWidth = 0.5
        for (const [i, j] of org.connections) {
          const nodeA = org.nodes[i]
          const nodeB = org.nodes[j]
          const dx = nodeA.x - nodeB.x
          const dy = nodeA.y - nodeB.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const opacity = Math.max(0, 1 - distance / MAX_DISTANCE)
          ctx.globalAlpha = opacity
          ctx.beginPath()
          ctx.moveTo(nodeA.x, nodeA.y)
          ctx.lineTo(nodeB.x, nodeB.y)
          ctx.stroke()
        }
        ctx.globalAlpha = 1.0

        for (let k = 0; k < organisms.length; k++) {
          if (k === organisms.indexOf(org)) continue
          const otherOrg = organisms[k]
          for (const nodeA of org.nodes) {
            for (const nodeB of otherOrg.nodes) {
              const dx = nodeA.x - nodeB.x
              const dy = nodeA.y - nodeB.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < EDGE_THRESHOLD) {
                interEdges.push({ nodeA, nodeB, dist })
              }
            }
          }
        }
      }

      ctx.strokeStyle = "#4094D0FF"
      ctx.lineWidth = 0.5
      for (const edge of interEdges) {
        const opacity = Math.max(0, 1 - edge.dist / EDGE_THRESHOLD)
        ctx.globalAlpha = opacity
        ctx.beginPath()
        ctx.moveTo(edge.nodeA.x, edge.nodeA.y)
        ctx.lineTo(edge.nodeB.x, edge.nodeB.y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1.0

      for (const org of organisms) {
        for (const node of org.nodes) {
          const radius = Math.max(0, node.size / 3)
          if (radius > 0) {
            ctx.fillStyle = "#8FF7F9FF"
            ctx.beginPath()
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
            ctx.fill()
          }
        }
      }

      const currentAnimations = [...animations]
      animations = []

      for (const anim of currentAnimations) {
        const elapsed = timestamp - anim.startTime
        const progress = Math.min(1, elapsed / anim.duration)

        const easedProgress = 1 - Math.pow(1 - progress, 3)
        const currentRadius = anim.maxRadius * easedProgress
        const halfRadiusProgress = currentRadius / anim.maxRadius >= 0.5

        const opacityProgress = Math.min(1, progress / 0.8)
        const opacity = 0.2 * (1 - opacityProgress)

        if (opacity > 0 && currentRadius > 0) {
          ctx.beginPath()
          ctx.arc(anim.x, anim.y, Math.max(0, currentRadius), 0, 2 * Math.PI)
          ctx.fillStyle = `rgba(64, 148, 208, ${opacity})`
          ctx.fill()
        }

        if (elapsed > anim.blastDelay) {
          const blastElapsed = elapsed - anim.blastDelay
          const blastProgress = Math.min(1, blastElapsed / (anim.duration * anim.blastSpeed))
          const blastEasedProgress = 1 - Math.pow(1 - blastProgress, 3)
          const blastRadius = anim.maxRadius * blastEasedProgress * 0.5
          const blastWaveWidth = 30
          const blastForceMultiplier = Math.max(0, 1 - blastProgress * 1.2)

          for (const org of organisms) {
            for (const node of org.nodes) {
              const dx = node.x - anim.x
              const dy = node.y - anim.y
              const distanceFromBlast = Math.sqrt(dx * dx + dy * dy)

              if (distanceFromBlast === 0) continue

              const directionX = dx / distanceFromBlast
              const directionY = dy / distanceFromBlast
              const distFromWaveEdge = distanceFromBlast - blastRadius

              if (distFromWaveEdge < 0 && distFromWaveEdge > -blastWaveWidth) {
                const waveDepthFactor = 1 - Math.abs(distFromWaveEdge) / blastWaveWidth
                const blastStrength = anim.blastForce * waveDepthFactor * blastForceMultiplier
                const massAdjustedForce = blastStrength / node.mass

                node.vx += directionX * massAdjustedForce
                node.vy += directionY * massAdjustedForce
                node.affectedByBlast = true

                if (halfRadiusProgress) {
                  node.lastBlastTime = timestamp
                } else {
                  node.lastBlastTime = timestamp + 1000000
                }
              }

              if (halfRadiusProgress && node.affectedByBlast && node.lastBlastTime > timestamp) {
                node.lastBlastTime = timestamp
              }
            }
          }
        }

        if (progress < 1) {
          animations.push({
            ...anim,
            radius: currentRadius
          })
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('click', handleClick)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <main className={styles.mainContainer}>
      <div className={styles.networkBackground}>
        <canvas ref={canvasRef} className={styles.networkCanvas}></canvas>
      </div>

      <div className={styles.contentOverlay}>
        <div className={styles.contentWrapper}>
          <div className={styles.videoContainer}>
            <div ref={videoOverlayRef} className={styles.videoOverlay}></div>

            <video
              ref={video1Ref}
              autoPlay
              loop
              muted
              playsInline
              className={`${styles.interactiveVideo} ${styles.videoVisible}`}
            >
              <source src="/spinner-1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <video
              ref={video2Ref}
              muted
              playsInline
              preload="auto"
              className={`${styles.interactiveVideo} ${styles.videoHidden} ${styles.videoAbsolute}`}
            >
              <source src="/spinner-2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className={styles.greetingText}>
            Greetings Starfighter!
          </div>

          <Link href="/design-experiments" className={styles.experimentsLink}>
            design experiments
          </Link>
        </div>
      </div>
    </main>
  )
}
