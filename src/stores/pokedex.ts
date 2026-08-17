import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { pokeApi } from '@/services/pokeapi'
import { ALL_TYPES } from '@/composables/useTypeData'
import type { NamedPokemon, PokemonSummary, PokemonTypeName } from '@/types'

type LoadStatus = 'idle' | 'loading' | 'error'

export const usePokedexStore = defineStore('pokedex', () => {
  const allPokemon = ref<NamedPokemon[]>([])
  const typeMembers = ref<Partial<Record<PokemonTypeName, number[]>>>({})
  const initialized = ref(false)

  const search = ref('')
  const selectedType = ref<PokemonTypeName | null>(null)
  const page = ref(1)
  const perPage = ref(20)

  const items = ref<PokemonSummary[]>([])
  const totalCount = ref(0)
  const status = ref<LoadStatus>('idle')
  const error = ref('')
  const hasLoaded = ref(false)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalCount.value / perPage.value)),
  )
  const hasPrev = computed(() => page.value > 1)
  const hasNext = computed(() => page.value < totalPages.value)
  const rangeStart = computed(() =>
    totalCount.value === 0 ? 0 : (page.value - 1) * perPage.value + 1,
  )
  const rangeEnd = computed(() =>
    Math.min(totalCount.value, page.value * perPage.value),
  )
  const isLoading = computed(() => status.value === 'loading')
  const hasError = computed(() => status.value === 'error')
  const typeOptions = ALL_TYPES

  /** Nomor urut untuk membatalkan respon yang basi saat filter berubah cepat. */
  let requestSeq = 0

  async function init() {
    if (initialized.value || allPokemon.value.length > 0) return
    initialized.value = true
    const list = await pokeApi.listAllSpecies()
    allPokemon.value = list.results.map((r) => ({
      id: pokeApi.idFromUrl(r.url),
      name: r.name,
    }))
  }

  async function ensureTypeMembers(type: PokemonTypeName): Promise<number[]> {
    const cached = typeMembers.value[type]
    if (cached !== undefined) return cached
    const info = await pokeApi.getType(type)
    const ids = info.pokemon.map((p) => pokeApi.idFromUrl(p.pokemon.url))
    typeMembers.value[type] = ids
    return ids
  }

  async function fetchPage() {
    const seq = ++requestSeq
    status.value = 'loading'
    error.value = ''

    try {
      await init()

      let pool = allPokemon.value
      if (selectedType.value !== null) {
        const ids = await ensureTypeMembers(selectedType.value)
        const idSet = new Set(ids)
        pool = pool.filter((p) => idSet.has(p.id))
      }

      const query = search.value.trim().toLowerCase()
      if (query) {
        pool = pool.filter((p) => p.name.includes(query))
      }

      if (seq !== requestSeq) return

      totalCount.value = pool.length
      const maxPage = Math.max(1, Math.ceil(pool.length / perPage.value))
      if (page.value > maxPage) page.value = maxPage

      const slice = pool.slice(
        (page.value - 1) * perPage.value,
        page.value * perPage.value,
      )

      const summaries = await pokeApi.getSummaries(slice.map((p) => p.id))
      if (seq !== requestSeq) return

      items.value = summaries
      status.value = 'idle'
      hasLoaded.value = true
    } catch (e) {
      if (seq !== requestSeq) return
      status.value = 'error'
      error.value =
        e instanceof Error ? e.message : 'Terjadi kesalahan saat memuat data.'
    }
  }

  async function setSearch(value: string) {
    search.value = value
    page.value = 1
    await fetchPage()
  }

  async function setType(type: PokemonTypeName | null) {
    selectedType.value = type
    page.value = 1
    await fetchPage()
  }

  async function goToPage(nextPage: number) {
    page.value = Math.min(Math.max(nextPage, 1), totalPages.value)
    await fetchPage()
  }

  return {
    allPokemon,
    search,
    selectedType,
    page,
    perPage,
    items,
    totalCount,
    totalPages,
    hasPrev,
    hasNext,
    rangeStart,
    rangeEnd,
    status,
    error,
    isLoading,
    hasError,
    hasLoaded,
    typeOptions,
    init,
    fetchPage,
    setSearch,
    setType,
    goToPage,
  }
})