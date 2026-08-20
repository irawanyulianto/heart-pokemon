<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { pokeApi } from '@/services/pokeapi'
import SearchBar from '@/components/SearchBar.vue'
import LoadingState from '@/components/LoadingState.vue'
import PokemonCard from '@/components/PokemonCard.vue'
import PokemonPopup from '@/components/PokemonPopup.vue'
import type { PokemonSummary } from '@/types'

const router = useRouter()

const query = ref('')
const popular = ref<PokemonSummary[]>([])
const popularStatus = ref<'loading' | 'error' | 'success'>('loading')
const selectedPokemon = ref<PokemonSummary | null>(null)

const popularIds = [25, 6, 94, 149, 150, 133, 143, 448, 130, 65, 658, 778]

onMounted(async () => {
  try {
    popular.value = await pokeApi.getSummaries(popularIds)
    popularStatus.value = 'success'
  } catch {
    popularStatus.value = 'error'
  }
})

function search() {
  const q = query.value.trim()
  if (!q) return
  void router.push({ path: '/pokedex', query: { q } })
}
</script>

<template>
  <div class="space-y-16 pb-4">
    <section
      class="relative -mx-4 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-sky-50 to-white sm:-mx-6 xl:-mx-[calc((100vw-69rem)/2)]"
    >
      <svg
        class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 text-primary-100/70"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="6" opacity="0.7" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="6" />
        <circle cx="50" cy="50" r="13" fill="#fff" stroke="currentColor" stroke-width="6" />
      </svg>

      <div
        class="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 sm:px-12 sm:py-16"
      >
        <div class="max-w-2xl">
        <h1 class="text-3xl font-extrabold tracking-tight text-primary-900 sm:text-4xl">
          Jelajahi Dunia Pokémon
        </h1>
        <p class="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Cari Pokémon, lihat statistik, tipe, evolusi, kelemahan, hingga
          kartu TCG-nya. Semua data diambil langsung dari PokéAPI dan TCGdex
          secara real-time.
        </p>

        <div class="mt-8 flex max-w-md flex-col gap-3">
          <SearchBar v-model="query" label="Cari Pokémon di homepage" />
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
              @click="search"
            >
              Cari
            </button>
            <RouterLink
              to="/pokedex"
              class="text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
            >
              atau buka Pokédex lengkap →
            </RouterLink>
          </div>
        </div>
      </div>
      </div>
    </section>

    <section aria-labelledby="popular-title">
      <div class="mb-6 flex items-end justify-between">
        <h2 id="popular-title" class="text-xl font-bold text-slate-900">
          Pokémon Populer
        </h2>
        <RouterLink
          to="/pokedex"
          class="text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          Lihat semua →
        </RouterLink>
      </div>

      <LoadingState
        v-if="popularStatus === 'loading'"
        compact
        message="Memuat daftar favorit…"
      />

      <ul
        v-else-if="popularStatus === 'success'"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        <li v-for="pokemon in popular" :key="pokemon.id">
          <PokemonCard :pokemon="pokemon" @select="selectedPokemon = $event" />
        </li>
      </ul>
    </section>
  </div>

  <PokemonPopup
    v-if="selectedPokemon"
    :pokemon="selectedPokemon"
    @close="selectedPokemon = null"
  />
</template>