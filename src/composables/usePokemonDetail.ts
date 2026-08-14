import { computed, onUnmounted, ref, watch } from 'vue'
import { usePokemonStore } from '@/stores/pokemon'
import type {
  Pokemon,
  PokemonSpecies,
  PokemonTypeInfo,
} from '@/types'

type PageStatus = 'loading' | 'success' | 'error'
type SectionStatus = 'loading' | 'success' | 'error'

/**
 * Mengatur seluruh pemuatan data halaman detail Pokémon:
 * pokemon utama, species, evolution chain, tipe (untuk type effectiveness),
 * dan kartu TCG. Mengembalikan state + refetch untuk view.
 *
 * `idGetter` berupa getter reaktif (mis. `() => props.id`) agar tetap
 * merespons saat pengguna berpindah antar Pokémon di rute yang sama.
 */
export function usePokemonDetail(idGetter: () => string) {
  const store = usePokemonStore()

  const status = ref<PageStatus>('loading')
  const error = ref('')
  const evolutionStatus = ref<SectionStatus>('loading')
  const typesStatus = ref<SectionStatus>('loading')
  const tcgStatus = ref<SectionStatus>('loading')

  const canonicalId = ref<number | null>(null)
  let seq = 0

  const pokemon = computed<Pokemon | undefined>(() =>
    canonicalId.value !== null
      ? store.pokemonById[canonicalId.value]
      : undefined,
  )
  const species = computed<PokemonSpecies | undefined>(() =>
    canonicalId.value !== null
      ? store.speciesById[canonicalId.value]
      : undefined,
  )
  const evolution = computed(() => {
    const s = species.value
    if (!s) return undefined
    const parts = s.evolution_chain.url.replace(/\/$/, '').split('/')
    return store.chainsById[Number(parts[parts.length - 1])]
  })
  const typeInfoMap = computed<Record<string, PokemonTypeInfo>>(() => {
    const p = pokemon.value
    if (!p) return {}
    const map: Record<string, PokemonTypeInfo> = {}
    for (const entry of p.types) {
      const info = store.typeInfoByName[entry.type.name]
      if (info) map[entry.type.name] = info
    }
    return map
  })
  const tcgCards = computed(() =>
    canonicalId.value !== null ? store.tcgById[canonicalId.value] : undefined,
  )

  async function loadSections(pokemonData: Pokemon, speciesData: PokemonSpecies) {
    evolutionStatus.value = 'loading'
    void store
      .getEvolutionChain(speciesData.evolution_chain.url)
      .then(() => {
        evolutionStatus.value = 'success'
      })
      .catch(() => {
        evolutionStatus.value = 'error'
      })

    typesStatus.value = 'loading'
    void Promise.all(pokemonData.types.map((t) => store.getTypeInfo(t.type.name)))
      .then(() => {
        typesStatus.value = 'success'
      })
      .catch(() => {
        typesStatus.value = 'error'
      })

    tcgStatus.value = 'loading'
    void store
      .getTcgCards(pokemonData.id, pokemonData.name)
      .then(() => {
        tcgStatus.value = 'success'
      })
      .catch(() => {
        tcgStatus.value = 'error'
      })
  }

  async function load() {
    const current = ++seq
    status.value = 'loading'
    error.value = ''

    try {
      const pokemonData = await store.getPokemon(idGetter())
      if (current !== seq) return
      canonicalId.value = pokemonData.id

      const speciesData = await store.getSpecies(pokemonData.id)
      if (current !== seq) return

      status.value = 'success'
      void loadSections(pokemonData, speciesData)
    } catch (e) {
      if (current !== seq) return
      status.value = 'error'
      error.value =
        e instanceof Error
          ? e.message
          : 'Pokémon tidak ditemukan atau terjadi kesalahan.'
    }
  }

  watch(
    idGetter,
    () => {
      canonicalId.value = null
      void load()
    },
    { immediate: true },
  )

  onUnmounted(() => {
    seq += 1
  })

  return {
    status,
    error,
    evolutionStatus,
    typesStatus,
    tcgStatus,
    pokemon,
    species,
    evolution,
    typeInfoMap,
    tcgCards,
    load,
  }
}