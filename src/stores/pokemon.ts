import { ref } from 'vue'
import { defineStore } from 'pinia'
import { pokeApi } from '@/services/pokeapi'
import { tcgdexApi } from '@/services/tcgdex'
import type {
  EvolutionChain,
  Pokemon,
  PokemonSpecies,
  PokemonTypeInfo,
  TcgCard,
} from '@/types'

/**
 * Penyimpanan data pokemon (per halaman detail).
 * Cache per-id di sini menambah lapisan store di atas cache service layer
 * supaya komponen tidak perlu tahu asal data.
 */
export const usePokemonStore = defineStore('pokemon', () => {
  const pokemonById = ref<Record<number, Pokemon>>({})
  const speciesById = ref<Record<number, PokemonSpecies>>({})
  const chainsById = ref<Record<number, EvolutionChain>>({})
  const typeInfoByName = ref<Record<string, PokemonTypeInfo>>({})
  const tcgById = ref<Record<number, TcgCard[]>>({})

  async function getPokemon(idOrName: string | number): Promise<Pokemon> {
    const data = await pokeApi.getPokemon(idOrName)
    pokemonById.value[data.id] = data
    return data
  }

  async function getSpecies(id: number): Promise<PokemonSpecies> {
    const cached = speciesById.value[id]
    if (cached) return cached
    const data = await pokeApi.getPokemonSpecies(id)
    speciesById.value[id] = data
    return data
  }

  async function getEvolutionChain(url: string): Promise<EvolutionChain> {
    const id = pokeApi.idFromUrl(url)
    const cached = chainsById.value[id]
    if (cached) return cached
    const data = await pokeApi.getEvolutionChainByUrl(url)
    chainsById.value[id] = data
    return data
  }

  async function getTypeInfo(name: string): Promise<PokemonTypeInfo> {
    const cached = typeInfoByName.value[name]
    if (cached) return cached
    const data = await pokeApi.getType(name)
    typeInfoByName.value[name] = data
    return data
  }

  async function getTcgCards(id: number, name: string): Promise<TcgCard[]> {
    const cached = tcgById.value[id]
    if (cached) return cached
    const cards = await tcgdexApi.getCardsByPokemon(name)
    tcgById.value[id] = cards
    return cards
  }

  return {
    pokemonById,
    speciesById,
    chainsById,
    typeInfoByName,
    tcgById,
    getPokemon,
    getSpecies,
    getEvolutionChain,
    getTypeInfo,
    getTcgCards,
  }
})