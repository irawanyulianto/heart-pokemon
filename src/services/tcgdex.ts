import { fetchJson, TTL } from './http'
import type { TcgCard, TcgCardDetailed, TcgCategory } from '@/types'

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

  /**
   * Cari kartu TCG berdasarkan nama (opsional difilter kategori).
   * Mengembalikan objek ramping dari endpoint list.
   */
  searchCards(query: string, category?: TcgCategory): Promise<TcgCard[]> {
    const q = query.trim().toLowerCase()
    if (!q && !category) return Promise.resolve([])
    const params = new URLSearchParams()
    if (q) params.set('name', q)
    if (category) params.set('category', category)
    return fetchJson<TcgCard[]>(`${BASE_URL}/cards?${params.toString()}`, {
      ttlMs: TTL.DAY,
    })
  },

  /** Ambil detail lengkap satu kartu berdasarkan id. */
  getCard(id: string): Promise<TcgCardDetailed> {
    return fetchJson<TcgCardDetailed>(
      `${BASE_URL}/cards/${encodeURIComponent(id)}`,
      { ttlMs: TTL.DAY, persist: true },
    )
  },
}