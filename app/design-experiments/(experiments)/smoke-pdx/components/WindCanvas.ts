// Wind as drifting particles, on a canvas of its own.
//
// Motion is the data here. Portland reads Good while monitors two hundred miles
// east read Very Unhealthy, and the reason is which way the air is moving. A
// field of arrows states that; a field of particles shows it, and the eye
// follows it without being asked to decode anything.
//
// Deliberately not `leaflet-velocity`, which does this but expects GFS-format
// u/v grids and would be a dependency for about two hundred lines we can own
// and tune. Revisit only if this fights us.
//
// This is not a React component. The canvas has to live inside a Leaflet pane
// to sit above the fire perimeters and below the monitor blooms, and portalling
// React into a pane Leaflet also transforms is more machinery than the job
// needs. MapView creates one of these and drives it.

import type { Map as LeafletMap } from 'leaflet'
import { edgeFade, type WindField } from './wind'

type LeafletModule = typeof import('leaflet')

export interface WindCanvasHandle {
  /** Swap the field after a refresh. Null parks the layer. */
  setField(field: WindField | null): void
  /** Layer toggle. Off stops the loop rather than hiding a running one. */
  setVisible(on: boolean): void
  destroy(): void
}

/**
 * Screen pixels per mph, per frame.
 *
 * Apparent speed is held constant across zoom rather than being true to the
 * ground. Physically correct motion would crawl at region zoom and streak off
 * the screen at street zoom, which tells the reader about the camera instead of
 * about the air. This is the same reasoning behind drawing the chevrons on a
 * screen lattice rather than on the data grid, and SOURCES.md says so.
 *
 * Slow on purpose. At three times this speed the particles read as falling
 * rain or as water droplets on glass, which is the wrong weather entirely. Wind
 * is the slow, steady thing here, and drifting at this rate is what makes it
 * legible as air moving rather than as precipitation.
 */
const PX_PER_MPH = 0.017

/** Frames a particle lives before it is respawned somewhere new. Without a
 *  ceiling the whole population drains downwind and leaves the upwind half of
 *  the map empty. Long, to match the slow drift: a particle that blinks out
 *  every second and a half reads as flicker, not as weather. Distance covered
 *  is this times the pace, so lengthening the journey happens here rather than
 *  by speeding anything up. */
const MAX_AGE = 430

/**
 * Frames of position history each particle keeps, which IS the tail length.
 *
 * The tail used to come from fading the canvas toward transparent each frame
 * rather than clearing it. That is the usual trick for this effect, and it is
 * subtly broken: canvas alpha is an 8-bit integer, so multiplying an almost
 * transparent pixel by 0.972 rounds straight back to the value it started at
 * and the faintest part of every trail never erases. Leaving the map still for
 * a minute left pale streaks across it, worst over the ocean where there is
 * nothing else to look at.
 *
 * So the canvas is cleared every frame and each particle draws its own recent
 * path instead. Nothing can accumulate, and the tail is a number here rather
 * than a side effect of a fade rate.
 */
const TAIL = 46

/** Alpha steps along the tail, newest to oldest. Three is enough for the taper
 *  to read, and it keeps a frame at a dozen or so stroke calls. */
const BANDS = 3

/** One particle per this many square pixels of map, so density is what the eye
 *  sees rather than what the data holds. */
const PX_PER_PARTICLE = 7000
const MIN_PARTICLES = 90
const MAX_PARTICLES = 620

/** Below this width, half the particles and half the frame rate. A phone
 *  renders the same field with a fraction of the budget. */
const SMALL_SCREEN = 640

/** Alpha tiers. Every particle in a tier is stroked in one call, so a frame
 *  costs a handful of canvas operations instead of one per particle. */
const TIERS = 5

export function createWindCanvas(opts: {
  L: LeafletModule
  map: LeafletMap
  pane: HTMLElement
  /** The one navy this map gives to wind. */
  color: string
}): WindCanvasHandle {
  const { L, map, pane, color } = opts

  const canvas = document.createElement('canvas')
  canvas.style.position = 'absolute'
  canvas.style.left = '0'
  canvas.style.top = '0'
  // The chip comes from a click on the map, so the canvas must never eat one.
  canvas.style.pointerEvents = 'none'
  canvas.style.willChange = 'transform'
  pane.appendChild(canvas)

  const ctx = canvas.getContext('2d')

  let field: WindField | null = null
  let visible = true
  let running = false
  let raf = 0
  let frame = 0
  let width = 0
  let height = 0
  let dpr = 1
  let small = false

  // Parallel arrays rather than objects: this is read and written every frame,
  // and a few hundred short-lived objects per frame is work the garbage
  // collector does not need.
  let px = new Float32Array(0)
  let py = new Float32Array(0)
  let age = new Float32Array(0)
  let count = 0

  // Position history: TAIL slots per particle in one flat ring buffer. Every
  // particle advances on the same frame, so they share a single write cursor
  // rather than each carrying its own.
  let hx = new Float32Array(0)
  let hy = new Float32Array(0)
  let head = 0

  // Which speed tier each particle landed in this frame, and -1 for one that
  // was just respawned and has nothing to draw yet. Kept so the draw pass can
  // group by tier without asking the field again.
  let tierOf = new Int8Array(0)
  const tierFade = new Float32Array(TIERS)
  const tierCount = new Float32Array(TIERS)

  const rgb = hexToRgb(color)

  function targetCount(): number {
    const area = width * height
    const base = Math.round(area / PX_PER_PARTICLE)
    const scaled = small ? base * 0.5 : base
    // Zoomed out to the whole smoke shed, the same density reads as static.
    // Thinning it keeps the regional view calm and the metro view lively.
    const byZoom = map.getZoom() <= 7 ? scaled * 0.7 : scaled
    return Math.max(MIN_PARTICLES, Math.min(Math.round(byZoom), MAX_PARTICLES))
  }

  function seedOne(i: number, fresh: boolean) {
    px[i] = Math.random() * width
    py[i] = Math.random() * height
    // Staggered ages on the first seed, so the whole population does not
    // respawn on the same frame forever after.
    age[i] = fresh ? Math.random() * MAX_AGE : 0
    tierOf[i] = -1
    // A respawned particle has no past. Collapsing its whole history onto the
    // new position makes every one of its segments zero-length, so it draws
    // nothing until it has actually travelled rather than whipping a tail
    // across the map from wherever it used to be.
    const base = i * TAIL
    for (let k = 0; k < TAIL; k++) {
      hx[base + k] = px[i]
      hy[base + k] = py[i]
    }
  }

  function reseed() {
    count = targetCount()
    if (px.length < count) {
      px = new Float32Array(count)
      py = new Float32Array(count)
      age = new Float32Array(count)
      tierOf = new Int8Array(count)
      hx = new Float32Array(count * TAIL)
      hy = new Float32Array(count * TAIL)
    }
    head = 0
    for (let i = 0; i < count; i++) seedOne(i, true)
  }

  function resize() {
    const size = map.getSize()
    width = size.x
    height = size.y
    small = width < SMALL_SCREEN
    // Cap at 2. A 3x phone display triples the fill cost for a difference
    // nobody can see on a one-pixel trail.
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  /** Pin the canvas to the container's top-left in layer coordinates, since
   *  Leaflet moves the pane underneath it on every pan. */
  function reposition() {
    L.DomUtil.setPosition(canvas, map.containerPointToLayerPoint([0, 0]))
  }

  function clear() {
    ctx?.clearRect(0, 0, width, height)
  }

  function step() {
    if (!ctx || !field) return

    // Cleared, not faded. See TAIL for why the usual fade leaves streaks that
    // never finish erasing.
    ctx.clearRect(0, 0, width, height)

    // Advance the cursor first, so the slot written below is the newest point
    // of every tail and segment 0 is always the step that just happened.
    head = (head + 1) % TAIL
    tierFade.fill(0)
    tierCount.fill(0)

    for (let i = 0; i < count; i++) {
      const x = px[i]
      const y = py[i]
      const ll = map.containerPointToLatLng([x, y])
      const s = field.at(ll.lat, ll.lng)
      if (!s) {
        seedOne(i, false)
        continue
      }

      const fade = edgeFade(ll.lat, ll.lng)
      if (fade <= 0.04) {
        seedOne(i, false)
        continue
      }

      // Screen y grows downward, so north is negative.
      const dx = s.u * PX_PER_MPH
      const dy = -s.v * PX_PER_MPH
      const nx = x + dx
      const ny = y + dy

      px[i] = nx
      py[i] = ny
      hx[i * TAIL + head] = nx
      hy[i * TAIL + head] = ny
      age[i] += 1

      if (age[i] > MAX_AGE || nx < 0 || ny < 0 || nx > width || ny > height) {
        seedOne(i, false)
        continue
      }

      // Speed drives opacity and width together, the same pairing the chevrons
      // use. A thin stroke has too little ink on screen for an opacity ramp
      // alone to read.
      const t = Math.min(s.speed / 22, 1)
      const tier = Math.min(Math.floor(t * TIERS), TIERS - 1)
      tierOf[i] = tier
      tierFade[tier] += fade
      tierCount[tier] += 1
    }

    // One path per speed tier per alpha band, so a frame is about a dozen
    // stroke calls no matter how many particles are in the air.
    const perBand = Math.ceil((TAIL - 1) / BANDS)
    ctx.lineCap = 'round'

    for (let tier = 0; tier < TIERS; tier++) {
      if (!tierCount[tier]) continue
      const t = (tier + 0.5) / TIERS
      // The edge fade varies per particle, so the tier takes the average of
      // what it is carrying. That keeps the region edge soft without needing a
      // stroke call per particle.
      const meanFade = tierFade[tier] / tierCount[tier]
      ctx.lineWidth = 1.2 + t * 1.7

      for (let b = 0; b < BANDS; b++) {
        // Band 0 holds the newest segments and draws at full strength; each
        // older band is dimmer, which is the taper from head to tail.
        const bandAlpha = (BANDS - b) / BANDS
        ctx.strokeStyle = `rgba(${rgb},${((0.3 + t * 0.55) * meanFade * bandAlpha).toFixed(3)})`
        ctx.beginPath()

        const kStart = b * perBand
        const kEnd = Math.min(kStart + perBand, TAIL - 1)
        for (let i = 0; i < count; i++) {
          if (tierOf[i] !== tier) continue
          const base = i * TAIL
          for (let k = kStart; k < kEnd; k++) {
            const a = (head - k + TAIL) % TAIL
            const c = (head - k - 1 + TAIL) % TAIL
            const x1 = hx[base + a]
            const y1 = hy[base + a]
            const x2 = hx[base + c]
            const y2 = hy[base + c]
            // Collapsed history from a respawn. Drawing it would put a stray
            // round dot wherever that particle was born.
            if (x1 === x2 && y1 === y2) continue
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
          }
        }
        ctx.stroke()
      }
    }
  }

  function loop() {
    if (!running) return
    frame++
    // Half rate on a phone. The trails are long enough that thirty frames a
    // second still reads as drift rather than as stutter.
    if (!small || frame % 2 === 0) step()
    raf = window.requestAnimationFrame(loop)
  }

  function start() {
    if (running || !visible || !field || document.hidden) return
    running = true
    raf = window.requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    if (raf) window.cancelAnimationFrame(raf)
    raf = 0
  }

  // ---- map events -----------------------------------------------------------
  //
  // Particles live in container pixels, which stop meaning anything the moment
  // the map starts moving. Rather than transform them mid-drag, the canvas goes
  // away for the length of the gesture and the field is reseeded for the new
  // view when it lands. It is the honest version of the tradeoff: a still frame
  // during a drag, and a correct field immediately after.
  const onMoveStart = () => {
    stop()
    canvas.style.opacity = '0'
  }

  const onMoveEnd = () => {
    resize()
    reposition()
    clear()
    reseed()
    canvas.style.opacity = '1'
    start()
  }

  const onResize = () => {
    resize()
    reposition()
    clear()
    reseed()
  }

  // An animation loop left running in a hidden tab is the classic leak in this
  // kind of layer, and browsers throttle it into stuttering garbage anyway.
  const onVisibility = () => {
    if (document.hidden) stop()
    else start()
  }

  map.on('movestart zoomstart', onMoveStart)
  map.on('moveend zoomend', onMoveEnd)
  map.on('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)

  resize()
  reposition()
  reseed()

  return {
    setField(next) {
      field = next
      if (!field) {
        stop()
        clear()
        return
      }
      start()
    },
    setVisible(on) {
      visible = on
      canvas.style.display = on ? '' : 'none'
      if (on) {
        // Coming back from off, the view has usually moved underneath.
        resize()
        reposition()
        clear()
        reseed()
        start()
      } else {
        stop()
        clear()
      }
    },
    destroy() {
      stop()
      map.off('movestart zoomstart', onMoveStart)
      map.off('moveend zoomend', onMoveEnd)
      map.off('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.remove()
    },
  }
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = parseInt(full, 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}
