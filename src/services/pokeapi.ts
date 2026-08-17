import { fetchJson, TTL } from './http'
import type {
  APIResourceList,
  EvolutionChain,
  Pokemon,
  PokemonSpecies,
  PokemonSummary,
  PokemonTypeInfo,
  PokemonTypeName,
} from '@/types'

const BASE_URL = 'https://pokeapi.co/api/v2'
const SPRITE_BASE_URL =
  'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites'

export function idFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/')
  return Number(parts[parts.length - 1])
}

export function officialArtworkUrl(id: number | string): string {
  return `${SPRITE_BASE_URL}/pokemon/other/official-artwork/${id}.png`
}

export function officialArtworkShinyUrl(id: number | string): string {
  return `${SPRITE_BASE_URL}/pokemon/other/official-artwork/shiny/${id}.png`
}

export function defaultSpriteUrl(id: number | string): string {
  return `${SPRITE_BASE_URL}/pokemon/${id}.png`
}

function toSummary(pokemon: Pokemon): PokemonSummary {
  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map((t) => t.type.name as PokemonTypeName),
    spriteUrl: officialArtworkUrl(pokemon.id),
  }
}

/** Jalankan tugas dengan batas konkurensi agar tidak membebani server. */
async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency = 6,
): Promise<T[]> {
  const results = new Array<T>(tasks.length)
  let index = 0

  const worker = async () => {
    while (index < tasks.length) {
      const current = index
      index += 1
      results[current] = await tasks[current]()
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()),
  )
  return results
}

export const pokeApi = {
  /**
   * Daftar seluruh species (bentuk dasar) untuk Pokédex.
   * Lebih bersih daripada daftar pokemon yang menyertakan form/variasi.
   */
  listAllSpecies(): Promise<APIResourceList> {
    return fetchJson<APIResourceList>(`${BASE_URL}/pokemon-species?limit=100000`, {
      ttlMs: TTL.WEEK,
      persist: true,
    })
  },

  getPokemon(idOrName: string | number): Promise<Pokemon> {
    return fetchJson<Pokemon>(`${BASE_URL}/pokemon/${idOrName}`, {
      ttlMs: TTL.DAY,
      persist: true,
    })
  },

  getSummary(idOrName: string | number): Promise<PokemonSummary> {
    return this.getPokemon(idOrName).then(toSummary)
  },

  getSummaries(ids: number[]): Promise<PokemonSummary[]> {
    return runWithConcurrency(
      ids.map((id) => () => this.getSummary(id)),
      8,
    )
  },

  getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    return fetchJson<PokemonSpecies>(`${BASE_URL}/pokemon-species/${idOrName}`, {
      ttlMs: TTL.DAY,
      persist: true,
    })
  },

  getEvolutionChain(id: number | string): Promise<EvolutionChain> {
    return fetchJson<EvolutionChain>(`${BASE_URL}/evolution-chain/${id}`, {
      ttlMs: TTL.DAY,
      persist: true,
    })
  },

  getEvolutionChainByUrl(url: string): Promise<EvolutionChain> {
    return this.getEvolutionChain(idFromUrl(url))
  },

  getType(name: string): Promise<PokemonTypeInfo> {
    return fetchJson<PokemonTypeInfo>(`${BASE_URL}/type/${name}`, {
      ttlMs: TTL.DAY,
      persist: true,
    })
  },

  /** Ekstrak id dari resource API list yang sering dipakai untuk pagination. */
  idFromUrl,
}