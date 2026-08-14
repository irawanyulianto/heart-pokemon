import { fetchJson, TTL } from './http'
import type { TcgCard } from '@/types'

const BASE_URL = 'https://api.tcgdex.net/v2/en'

export const tcgdexApi = {
  /**
   * Ambil kartu TCG untuk satu nama Pokémon.
   * Endpoint list ({@link https://tcgdex.dev/rest/cards}) mengembalikan objek
   * ramping (id, localId, name, image).
   */
  getCardsByPokemon(name: string): Promise<TcgCard[]> {
    const query = encodeURIComponent(name.toLowerCase().trim())
    return fetchJson<TcgCard[]>(`${BASE_URL}/cards?name=${query}`, {
      ttlMs: TTL.DAY,
    })
  },
}