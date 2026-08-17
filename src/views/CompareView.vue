<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePokemonStore } from '@/stores/pokemon'
import { defaultSpriteUrl } from '@/services/pokeapi'
import PokemonPicker from '@/components/PokemonPicker.vue'
import PokemonImage from '@/components/PokemonImage.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import {
  formatHeight,
  formatPokemonName,
  formatWeight,
  pokedexNumber,
  statLabel,
} from '@/utils/format'
import type { NamedPokemon, Pokemon, PokemonTypeName } from '@/types'

interface CompareSlot {
  id: number
  selection: NamedPokemon | null
  detail: Pokemon | null
  status: 'idle' | 'loading' | 'error'
}

const pokemonStore = usePokemonStore()
const MAX_SLOTS = 6

let nextId = 0
const slots = ref<CompareSlot[]>([
  { id: ++nextId, selection: null, detail: null, status: 'idle' },
  { id: ++nextId, selection: null, detail: null, status: 'idle' },
])

function addSlot() {
  if (slots.value.length >= MAX_SLOTS) return
  slots.value.push({ id: ++nextId, selection: null, detail: null, status: 'idle' })
}

function removeSlot(slot: CompareSlot) {
  if (slots.value.length <= 2) return
  slots.value = slots.value.filter((s) => s.id !== slot.id)
}

function clearAll() {
  for (const slot of slots.value) {
    slot.selection = null
    slot.detail = null
    slot.status = 'idle'
  }
}

const hasSelection = computed(() =>
  slots.value.some((s) => s.selection !== null),
)

function excludedFor(slot: CompareSlot): NamedPokemon[] {
  return slots.value
    .filter((s) => s.id !== slot.id && s.selection !== null)
    .map((s) => s.selection as NamedPokemon)
}

function onSlotChange(slot: CompareSlot, value: NamedPokemon | null) {
  slot.selection = value
  void loadSlot(slot)
}

async function loadSlot(slot: CompareSlot) {
  slot.detail = null
  if (!slot.selection) {
    slot.status = 'idle'
    return
  }
  slot.status = 'loading'
  try {
    slot.detail = await pokemonStore.getPokemon(slot.selection.id)
    slot.status = 'idle'
  } catch {
    slot.status = 'error'
  }
}

const filledSlots = computed<Array<CompareSlot & { detail: Pokemon }>>(
  () =>
    slots.value.filter(
      (s): s is CompareSlot & { detail: Pokemon } => s.detail !== null,
    ),
)

const gridStyle = computed(() => ({
  gridTemplateColumns: `150px repeat(${Math.max(1, filledSlots.value.length)}, minmax(0, 1fr))`,
}))

interface StatRow {
  label: string
  values: number[]
  bestIndex: number
}

const STAT_KEYS = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
]

const statRows = computed<StatRow[]>(() => {
  const list = filledSlots.value
  if (list.length === 0) return []
  return STAT_KEYS.map((key) => {
    const values = list.map((s) => {
      const stat = s.detail.stats.find((x) => x.stat.name === key)
      return stat?.base_stat ?? 0
    })
    const best = Math.max(...values)
    return { label: statLabel(key), values, bestIndex: values.indexOf(best) }
  })
})

const totals = computed(() => {
  const list = filledSlots.value
  if (list.length === 0) return { values: [] as number[], bestIndex: -1 }
  const values = list.map((s) =>
    s.detail.stats.reduce((sum, x) => sum + x.base_stat, 0),
  )
  const best = Math.max(...values)
  return { values, bestIndex: values.indexOf(best) }
})

function typesOf(slot: CompareSlot & { detail: Pokemon }): PokemonTypeName[] {
  return slot.detail.types.map((t) => t.type.name as PokemonTypeName)
}

function isBest(index: number, bestIndex: number): boolean {
  return filledSlots.value.length > 1 && index === bestIndex
}
</script>

<template>
  <section aria-labelledby="compare-title">
    <header class="mb-6">
      <h1
        id="compare-title"
        class="text-2xl font-bold tracking-tight text-slate-900"
      >
        Compare Pokémon
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Bandingkan statistik dasar, tipe, dan fisik beberapa Pokémon sekaligus.
        Nilai tertinggi pada setiap baris akan disorot.
      </p>
    </header>

    <div class="flex flex-col items-stretch gap-3 lg:flex-row lg:items-start">
      <div
        class="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="(slot, index) in slots"
          :key="slot.id"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="mb-3 flex items-center justify-between">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-400"
            >
              Slot {{ index + 1 }}
            </span>
            <button
              v-if="slots.length > 2"
              type="button"
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              @click="removeSlot(slot)"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Hapus
            </button>
          </div>

          <PokemonPicker
            :model-value="slot.selection"
            :excluded="excludedFor(slot)"
            :placeholder="`Pilih Pokémon ${index + 1}\u2026`"
            label="Pilih Pokémon untuk dibandingkan"
            @update:model-value="onSlotChange(slot, $event)"
          />

          <p
            v-if="slot.status === 'loading'"
            class="mt-3 flex items-center gap-2 text-xs text-slate-400"
          >
            <span
              class="h-3 w-3 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
            />
            Memuat data…
          </p>
          <p
            v-else-if="slot.status === 'error'"
            class="mt-3 text-xs text-red-600"
          >
            Gagal memuat Pokémon ini. Coba pilih yang lain.
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-2 lg:mt-7">
      <button
        type="button"
        :disabled="slots.length >= MAX_SLOTS"
        class="inline-flex items-center justify-center gap-2 rounded-full border border-dashed border-primary-400 px-5 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
        @click="addSlot"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Tambah Pokémon
      </button>
      <button
        type="button"
        :disabled="!hasSelection"
        class="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        @click="clearAll"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Hapus Semua
      </button>
    </div>
  </div>

    <EmptyState
      v-if="filledSlots.length === 0"
      message="Pilih minimal satu Pokémon untuk mulai membandingkan."
    />

    <div v-else class="mt-10">
      <p class="mb-2 text-xs text-slate-400 md:hidden" role="note">
        Geser tabel ke samping untuk melihat semua kolom →.
      </p>
      <div class="overflow-x-auto pb-2">
        <div class="min-w-[560px] space-y-2">
          <div class="grid items-stretch gap-2" :style="gridStyle">
            <div
              class="sticky left-0 z-10 flex items-end rounded-xl bg-slate-50 px-3 pb-2 text-sm font-semibold text-slate-500 shadow-[8px_0_8px_-8px_rgba(0,0,0,0.15)]"
            >
              Pokémon
            </div>
            <div
              v-for="slot in filledSlots"
              :key="slot.id"
              class="flex flex-col items-center gap-2 rounded-2xl border border-primary-100 bg-gradient-to-b from-sky-50 to-white p-4 shadow-sm"
            >
              <div class="h-20 w-20">
                <PokemonImage
                  :pokemon-id="slot.detail.id"
                  :src="defaultSpriteUrl(slot.detail.id)"
                />
              </div>
              <RouterLink
                :to="`/pokemon/${slot.detail.name}`"
                class="text-sm font-bold text-slate-800 hover:text-primary-700"
              >
                {{ formatPokemonName(slot.detail.name) }}
              </RouterLink>
            <span class="text-xs font-semibold text-slate-400">
              {{ pokedexNumber(slot.detail.id) }}
            </span>
            <div class="flex flex-wrap justify-center gap-1">
              <TypeBadge
                v-for="type in typesOf(slot)"
                :key="type"
                :type="type"
                size="sm"
              />
            </div>
          </div>
        </div>

        <div class="grid items-center gap-2" :style="gridStyle">
          <p class="sticky left-0 z-10 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 shadow-[8px_0_8px_-8px_rgba(0,0,0,0.15)]">
            Tinggi
          </p>
          <div
            v-for="slot in filledSlots"
            :key="slot.id"
            class="rounded-xl bg-slate-50 px-3 py-2 text-center text-sm font-bold text-slate-800"
          >
            {{ formatHeight(slot.detail.height) }}
          </div>
        </div>

        <div class="grid items-center gap-2" :style="gridStyle">
          <p class="sticky left-0 z-10 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 shadow-[8px_0_8px_-8px_rgba(0,0,0,0.15)]">
            Berat
          </p>
          <div
            v-for="slot in filledSlots"
            :key="slot.id"
            class="rounded-xl bg-slate-50 px-3 py-2 text-center text-sm font-bold text-slate-800"
          >
            {{ formatWeight(slot.detail.weight) }}
          </div>
        </div>

        <div
          v-for="row in statRows"
          :key="row.label"
          class="grid items-center gap-2"
          :style="gridStyle"
        >
          <p class="sticky left-0 z-10 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 shadow-[8px_0_8px_-8px_rgba(0,0,0,0.15)]">
            {{ row.label }}
          </p>
          <div
            v-for="(value, index) in row.values"
            :key="index"
            class="rounded-xl px-3 py-2 text-center text-sm font-bold"
            :class="
              isBest(index, row.bestIndex)
                ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
                : 'bg-slate-50 text-slate-800'
            "
          >
            {{ value }}
            <span v-if="isBest(index, row.bestIndex)" class="sr-only">
              (terbaik)
            </span>
          </div>
        </div>

        <div class="grid items-center gap-2" :style="gridStyle">
          <p class="sticky left-0 z-10 rounded-xl bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-800 shadow-[8px_0_8px_-8px_rgba(0,0,0,0.15)]">
            Total Base Stats
          </p>
          <div
            v-for="(value, index) in totals.values"
            :key="index"
            class="rounded-xl px-3 py-2 text-center text-sm font-extrabold"
            :class="
              isBest(index, totals.bestIndex)
                ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
                : 'bg-slate-50 text-slate-800'
            "
          >
            {{ value }}
          </div>
        </div>
        </div>
      </div>
    </div>
  </section>
</template>