import type { PokemonTypeName } from '@/types'

export interface TypeMeta {
  label: string
  /** Badge lunak (bg terang + teks gelap). */
  badge: string
  /** Badge penuh (bg solid + teks putih). */
  solid: string
}

export const ALL_TYPES: PokemonTypeName[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

const TYPE_META: Record<PokemonTypeName, TypeMeta> = {
  normal: {
    label: 'Normal',
    badge: 'bg-slate-200 text-slate-700',
    solid: 'bg-slate-500 text-white',
  },
  fire: {
    label: 'Api',
    badge: 'bg-orange-100 text-orange-700',
    solid: 'bg-orange-500 text-white',
  },
  water: {
    label: 'Air',
    badge: 'bg-blue-100 text-blue-700',
    solid: 'bg-blue-500 text-white',
  },
  electric: {
    label: 'Listrik',
    badge: 'bg-yellow-100 text-yellow-700',
    solid: 'bg-yellow-400 text-slate-900',
  },
  grass: {
    label: 'Rumput',
    badge: 'bg-green-100 text-green-700',
    solid: 'bg-green-500 text-white',
  },
  ice: {
    label: 'Es',
    badge: 'bg-cyan-100 text-cyan-700',
    solid: 'bg-cyan-500 text-white',
  },
  fighting: {
    label: 'Bertarung',
    badge: 'bg-red-100 text-red-700',
    solid: 'bg-red-500 text-white',
  },
  poison: {
    label: 'Racun',
    badge: 'bg-purple-100 text-purple-700',
    solid: 'bg-purple-500 text-white',
  },
  ground: {
    label: 'Tanah',
    badge: 'bg-amber-100 text-amber-700',
    solid: 'bg-amber-500 text-white',
  },
  flying: {
    label: 'Terbang',
    badge: 'bg-sky-100 text-sky-700',
    solid: 'bg-sky-500 text-white',
  },
  psychic: {
    label: 'Psikis',
    badge: 'bg-pink-100 text-pink-700',
    solid: 'bg-pink-500 text-white',
  },
  bug: {
    label: 'Serangga',
    badge: 'bg-lime-100 text-lime-700',
    solid: 'bg-lime-500 text-white',
  },
  rock: {
    label: 'Batu',
    badge: 'bg-yellow-200 text-yellow-800',
    solid: 'bg-yellow-600 text-white',
  },
  ghost: {
    label: 'Hantu',
    badge: 'bg-indigo-100 text-indigo-700',
    solid: 'bg-indigo-500 text-white',
  },
  dragon: {
    label: 'Naga',
    badge: 'bg-violet-100 text-violet-700',
    solid: 'bg-violet-500 text-white',
  },
  dark: {
    label: 'Gelap',
    badge: 'bg-zinc-200 text-zinc-800',
    solid: 'bg-zinc-600 text-white',
  },
  steel: {
    label: 'Baja',
    badge: 'bg-slate-200 text-slate-600',
    solid: 'bg-slate-600 text-white',
  },
  fairy: {
    label: 'Peri',
    badge: 'bg-rose-100 text-rose-700',
    solid: 'bg-rose-500 text-white',
  },
}

export function getTypeMeta(type: PokemonTypeName): TypeMeta {
  return TYPE_META[type]
}

export function getTypeLabel(type: string): string {
  return TYPE_META[type as PokemonTypeName]?.label ?? type
}

/** Cek apakah string termasuk tipe Pokémon yang dikenal. */
export function isPokemonType(type: string): type is PokemonTypeName {
  return type in TYPE_META
}

export function typeBadge(type: PokemonTypeName): string {
  return TYPE_META[type].badge
}

export function typeSolid(type: PokemonTypeName): string {
  return TYPE_META[type].solid
}

export function typeFromApiName(type: string): PokemonTypeName | null {
  return isPokemonType(type) ? type : null
}