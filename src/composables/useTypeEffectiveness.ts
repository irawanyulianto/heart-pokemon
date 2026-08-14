import { ALL_TYPES } from './useTypeData'
import type {
  PokemonTypeInfo,
  PokemonTypeName,
  TypeRelations,
} from '@/types'

export interface TypeMultiplier {
  type: PokemonTypeName
  multiplier: number
}

function damageFromMultiplier(attacker: PokemonTypeName, relations: TypeRelations): number {
  if (relations.no_damage_from.some((r) => r.name === attacker)) return 0
  if (relations.half_damage_from.some((r) => r.name === attacker)) return 0.5
  if (relations.double_damage_from.some((r) => r.name === attacker)) return 2
  return 1
}

function damageToMultiplier(defender: PokemonTypeName, relations: TypeRelations): number {
  if (relations.no_damage_to.some((r) => r.name === defender)) return 0
  if (relations.half_damage_to.some((r) => r.name === defender)) return 0.5
  if (relations.double_damage_to.some((r) => r.name === defender)) return 2
  return 1
}

/**
 * Kelipatan damage yang diterima Pokémon dari tiap-tiap tipe serangan.
 * Map kunci = nama tipe pertahanan → info tipe dari API.
 */
export function computeDefensiveMultipliers(
  defensiveTypes: PokemonTypeName[],
  typeInfoMap: Record<string, PokemonTypeInfo>,
): TypeMultiplier[] {
  return ALL_TYPES.map((attacker) => {
    let multiplier = 1
    for (const defType of defensiveTypes) {
      const info = typeInfoMap[defType]
      if (!info) continue
      multiplier *= damageFromMultiplier(attacker, info.damage_relations)
    }
    return { type: attacker, multiplier }
  })
}

/**
 * Kelipatan damage yang diberikan Pokémon ke tiap-tiap tipe musuh.
 * Map kunci = nama tipe penyerang → info tipe dari API.
 */
export function computeOffensiveMultipliers(
  attackerTypes: PokemonTypeName[],
  typeInfoMap: Record<string, PokemonTypeInfo>,
): TypeMultiplier[] {
  return ALL_TYPES.map((defender) => {
    let multiplier = 1
    for (const atkType of attackerTypes) {
      const info = typeInfoMap[atkType]
      if (!info) continue
      multiplier *= damageToMultiplier(defender, info.damage_relations)
    }
    return { type: defender, multiplier }
  })
}

/** Format kelipatan untuk tampilan: 0, ½, 1, 2, 4. */
export function formatMultiplier(multiplier: number): string {
  if (multiplier === 0.5) return '½'
  return String(multiplier)
}

/** Tanda warna untuk pelindung defensif berdasarkan kelipatan. */
export function defensiveTone(multiplier: number): string {
  if (multiplier === 0) return 'bg-slate-900 text-white'
  if (multiplier < 1) return 'bg-green-200 text-green-800'
  if (multiplier === 1) return 'bg-slate-100 text-slate-600'
  if (multiplier === 2) return 'bg-orange-200 text-orange-800'
  return 'bg-red-300 text-red-900'
}

/** Tanda warna untuk daya ofensif berdasarkan kelipatan. */
export function offensiveTone(multiplier: number): string {
  if (multiplier === 0) return 'bg-slate-200 text-slate-500'
  if (multiplier < 1) return 'bg-red-200 text-red-800'
  if (multiplier === 1) return 'bg-slate-100 text-slate-600'
  if (multiplier === 2) return 'bg-orange-200 text-orange-800'
  return 'bg-green-300 text-green-900'
}