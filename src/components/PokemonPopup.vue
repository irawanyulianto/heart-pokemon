<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { pokeApi } from '@/services/pokeapi'
import PokemonImage from '@/components/PokemonImage.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import StatBar from '@/components/StatBar.vue'
import {
  capitalize,
  formatHeight,
  formatWeight,
  pokedexNumber,
  statLabel,
} from '@/utils/format'
import type { Pokemon, PokemonSummary } from '@/types'

const props = defineProps<{ pokemon: PokemonSummary }>()
const emit = defineEmits<{ close: [] }>()

const detail = ref<Pokemon | null>(null)

const stats = computed(() =>
  (detail.value?.stats ?? []).map((s) => ({
    label: statLabel(s.stat.name),
    value: s.base_stat,
  })),
)
const statsTotal = computed(() =>
  stats.value.reduce((sum, s) => sum + s.value, 0),
)

watch(
  () => props.pokemon.id,
  () => {
    detail.value = null
    void pokeApi
      .getPokemon(props.pokemon.id)
      .then((d) => {
        detail.value = d
      })
      .catch(() => {
        detail.value = null
      })
  },
  { immediate: true },
)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

window.addEventListener('keydown', onKeydown)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="`Info ${capitalize(pokemon.name)}`"
    >
      <div
        class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        @click="emit('close')"
      />

      <div
        class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <button
          type="button"
          aria-label="Tutup"
          class="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-800"
          @click="emit('close')"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div
          class="flex flex-col items-center gap-2 bg-gradient-to-b from-sky-50 to-white px-6 pb-4 pt-8"
        >
          <div class="h-36 w-36">
            <PokemonImage :pokemon-id="pokemon.id" :src="pokemon.spriteUrl" />
          </div>
          <span class="text-xs font-bold tracking-wide text-slate-400">
            {{ pokedexNumber(pokemon.id) }}
          </span>
          <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">
            {{ capitalize(pokemon.name) }}
          </h2>
          <div class="flex flex-wrap justify-center gap-2">
            <TypeBadge
              v-for="type in pokemon.types"
              :key="type"
              :type="type"
              solid
            />
          </div>
        </div>

        <div class="flex flex-col gap-3 bg-white px-6 pb-6">
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-slate-50 px-3 py-2.5 text-center">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Tinggi
              </p>
              <p class="mt-0.5 text-sm font-bold text-slate-800">
                {{ detail ? formatHeight(detail.height) : '…' }}
              </p>
            </div>
            <div class="rounded-xl bg-slate-50 px-3 py-2.5 text-center">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Berat
              </p>
              <p class="mt-0.5 text-sm font-bold text-slate-800">
                {{ detail ? formatWeight(detail.weight) : '…' }}
              </p>
            </div>
          </div>

          <div
            v-if="stats.length > 0"
            class="rounded-xl bg-slate-50 px-4 py-3"
          >
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Base Stats
            </p>
            <div class="mt-2.5 flex flex-col gap-2">
              <StatBar
                v-for="stat in stats"
                :key="stat.label"
                :label="stat.label"
                :value="stat.value"
              />
            </div>
            <p class="mt-2 text-xs font-medium text-slate-500">
              Total base stats:
              <span class="font-bold text-slate-800">{{ statsTotal }}</span>
            </p>
          </div>

          <RouterLink
            :to="`/pokemon/${pokemon.name}`"
            class="rounded-full bg-primary-500 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
            @click="emit('close')"
          >
            Lihat Detail →
          </RouterLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>