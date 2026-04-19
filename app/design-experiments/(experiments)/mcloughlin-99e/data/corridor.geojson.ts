import type { CorridorFeature } from '../types'
import corridorRaw from './corridor.json'

export const corridor = corridorRaw as unknown as CorridorFeature

export const CORRIDOR_CENTER: [number, number] = corridor.center
