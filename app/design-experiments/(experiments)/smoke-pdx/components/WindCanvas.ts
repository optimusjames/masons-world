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

/** How fast trails fade. Higher erases sooner, so trails read shorter. Low,
 *  because each frame now advances a particle a fraction of a pixel, and a
 *  quick fade at that pace would leave a dot with no tail behind it. The tail
 *  is the part that carries direction, so it is worth the pixels. */
const TRAIL_FADE = 0.028

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
  }

  function reseed() {
    count = targetCount()
    if (px.length < count) {
      px = new Float32Array(count)
      py = new Float32Array(count)
      age = new Float32Array(count)
    }
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

    // Trails come from fading what is already drawn instead of clearing it.
    // `destination-out` fades toward transparent rather than toward a color,
    // which matters here: painting the map background over the canvas each
    // frame would leave a fog sitting on top of the basemap.
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = `rgba(0,0,0,${TRAIL_FADE})`
    ctx.fillRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'source-over'

    // Collected per tier, then stroked in one path each.
    const tiers: number[][] = Array.from({ length: TIERS }, () => [])

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

      // Speed drives opacity and width together, the same pairing the chevrons
      // use. A thin stroke has too little ink on screen for an opacity ramp
      // alone to read.
      const t = Math.min(s.speed / 22, 1)
      const tier = Math.min(Math.floor(t * TIERS), TIERS - 1)
      tiers[tier].push(x, y, nx, ny, fade)

      px[i] = nx
      py[i] = ny
      age[i] += 1

      if (age[i] > MAX_AGE || nx < 0 || ny < 0 || nx > width || ny > height) {
        seedOne(i, false)
      }
    }

    for (let tier = 0; tier < TIERS; tier++) {
      const seg = tiers[tier]
      if (!seg.length) continue
      const t = (tier + 0.5) / TIERS
      ctx.lineWidth = 1.2 + t * 1.7
      ctx.lineCap = 'round'
      // One alpha per tier. The edge fade varies per particle, so the tier
      // takes the average of what it is carrying rather than a single value,
      // which keeps the region edge soft without a stroke call per particle.
      let fadeSum = 0
      for (let i = 4; i < seg.length; i += 5) fadeSum += seg[i]
      const meanFade = fadeSum / (seg.length / 5)
      ctx.strokeStyle = `rgba(${rgb},${((0.3 + t * 0.55) * meanFade).toFixed(3)})`
      ctx.beginPath()
      for (let i = 0; i < seg.length; i += 5) {
        ctx.moveTo(seg[i], seg[i + 1])
        ctx.lineTo(seg[i + 2], seg[i + 3])
      }
      ctx.stroke()
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
