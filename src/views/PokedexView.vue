<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePokedexStore } from '@/stores/pokedex'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { getTypeMeta } from '@/composables/useTypeData'
import SearchBar from '@/components/SearchBar.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import EmptyState from '@/components/EmptyState.vue'
import PokemonCard from '@/components/PokemonCard.vue'
import PokemonPopup from '@/components/PokemonPopup.vue'
import Pagination from '@/components/Pagination.vue'
import type { PokemonSummary, PokemonTypeName } from '@/types'

const route = useRoute()
const store = usePokedexStore()

const searchInput = ref('')
const debouncedSearch = useDebouncedValue(() => searchInput.value, 350)

const selectedPokemon = ref<PokemonSummary | null>(null)

watch(debouncedSearch, (value) => {
  void store.setSearch(value)
})

function selectType(type: PokemonTypeName | null) {
  void store.setType(type)
}

onMounted(() => {
  const q = typeof route.query.q === 'string' ? route.query.q : ''
  if (q) searchInput.value = q
  if (!store.hasLoaded) void store.fetchPage()
})
</script>

<template>
  <section aria-labelledby="pokedex-title">
    <div class="mb-6 flex flex-col gap-4">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1
            id="pokedex-title"
            class="text-2xl font-bold tracking-tight text-slate-900"
          >
            Pokédex
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            {{ store.totalCount }} Pokémon
            <template v-if="store.search"> — pencarian “{{ store.search }}”</template>
            <template v-else-if="store.selectedType">
              — tipe {{ getTypeMeta(store.selectedType).label }}
            </template>
          </p>
        </div>
        <button
          v-if="store.search || store.selectedType"
          type="button"
          class="rounded-full border border-primary-300 bg-white px-4 py-1.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
          @click="
            searchInput = '';
            selectType(null);
          "
        >
          Reset filter
        </button>
      </div>

      <SearchBar v-model="searchInput" />

      <div
        class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Filter tipe"
      >
        <button
          type="button"
          class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
          :class="
            store.selectedType === null
              ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
              : 'border-slate-300 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700'
          "
          @click="selectType(null)"
        >
          Semua
        </button>
        <button
          v-for="type in store.typeOptions"
          :key="type"
          type="button"
          :aria-pressed="store.selectedType === type"
          class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
          :class="
            store.selectedType === type
              ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
              : 'border-slate-300 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700'
          "
          @click="selectType(type)"
        >
          {{ getTypeMeta(type).label }}
        </button>
      </div>
    </div>

    <ErrorState
      v-if="store.hasError"
      :message="store.error"
      @retry="store.fetchPage()"
    />

    <LoadingState v-else-if="store.isLoading" message="Menyiapkan Pokédex…" />

    <template v-else-if="store.items.length > 0">
      <ul
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <li v-for="pokemon in store.items" :key="pokemon.id">
          <PokemonCard :pokemon="pokemon" @select="selectedPokemon = $event" />
        </li>
      </ul>

      <div class="mt-8 flex justify-center">
        <Pagination
          :page="store.page"
          :total-pages="store.totalPages"
          :total-count="store.totalCount"
          :range-start="store.rangeStart"
          :range-end="store.rangeEnd"
          @page="store.goToPage($event)"
        />
      </div>
    </template>

    <EmptyState v-else />
  </section>

  <PokemonPopup
    v-if="selectedPokemon"
    :pokemon="selectedPokemon"
    @close="selectedPokemon = null"
  />
</template>