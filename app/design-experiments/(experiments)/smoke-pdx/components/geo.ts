// Small spherical helpers. Good enough at regional scale, and they keep a
// geodesy dependency out of the bundle for three formulas.

const toRad = (d: number) => (d * Math.PI) / 180

/** Miles between two [lat, lng] points. */
export function milesBetween(a: [number, number], b: [number, number]): number {
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 3958.8 * 2 * Math.asin(Math.sqrt(h))
}

/** Compass heading in degrees from a to b, 0 = north, clockwise. */
export function headingBetween(a: [number, number], b: [number, number]): number {
  const dLng = toRad(b[1] - a[1])
  const y = Math.sin(dLng) * Math.cos(toRad(b[0]))
  const x =
    Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) -
    Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/**
 * The bounding box of any GeoJSON coordinate nest, polygon or multipolygon.
 * The geometry is typed `unknown` upstream because it arrives from ArcGIS, so
 * this walks it with runtime checks rather than trusting a cast.
 */
export function coordBounds(coords: unknown): [[number, number], [number, number]] | null {
  let s = 90
  let w = 180
  let n = -90
  let e = -180
  const walk = (c: unknown) => {
    if (!Array.isArray(c)) return
    if (typeof c[0] === 'number' && typeof c[1] === 'number') {
      const [lng, lat] = c as [number, number]
      if (lat < s) s = lat
      if (lat > n) n = lat
      if (lng < w) w = lng
      if (lng > e) e = lng
      return
    }
    for (const child of c) walk(child)
  }
  walk(coords)
  return n >= s && e >= w ? [[s, w], [n, e]] : null
}
