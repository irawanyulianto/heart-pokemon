<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePokemonStore } from '@/stores/pokemon'
import PokemonPicker from '@/components/PokemonPicker.vue'
import {
  computeDefensiveMultipliers,
  defensiveTone,
  formatMultiplier,
} from '@/composables/useTypeEffectiveness'
import { ALL_TYPES, getTypeLabel } from '@/composables/useTypeData'
import { formatPokemonName } from '@/utils/format'
import type { NamedPokemon, PokemonTypeInfo, PokemonTypeName } from '@/types'

const pokemonStore = usePokemonStore()

const selectedPokemon = ref<NamedPokemon | null>(null)
const pokemonStatus = ref<'idle' | 'loading' | 'error'>('idle')
const defensiveTypes = ref<PokemonTypeName[]>([])
const selectedAttack = ref<PokemonTypeName>('fire')

const typeInfoMap = ref<Record<string, PokemonTypeInfo>>({})
const typesStatus = ref<'idle' | 'loading' | 'error'>('idle')

let pokemonSeq = 0
let typeSeq = 0

async function loadPokemon() {
  const seq = ++pokemonSeq
  pokemonStatus.value = 'idle'
  defensiveTypes.value = []
  typeInfoMap.value = {}
  if (!selectedPokemon.value) return

  pokemonStatus.value = 'loading'
  try {
    const detail = await pokemonStore.getPokemon(selectedPokemon.value.id)
    if (seq !== pokemonSeq) return
    defensiveTypes.value = detail.types.map(
      (t) => t.type.name as PokemonTypeName,
    )
    pokemonStatus.value = 'idle'
  } catch {
    if (seq !== pokemonSeq) return
    pokemonStatus.value = 'error'
  }
}

async function loadTypeInfo() {
  const seq = ++typeSeq
  typesStatus.value = 'loading'
  try {
    await Promise.all(defensiveTypes.value.map((t) => pokemonStore.getTypeInfo(t)))
    if (seq !== typeSeq) return
    const map: Record<string, PokemonTypeInfo> = {}
    for (const type of defensiveTypes.value) {
      const info = pokemonStore.typeInfoByName[type]
      if (info) map[type] = info
    }
    typeInfoMap.value = map
    typesStatus.value = 'idle'
  } catch {
    if (seq !== typeSeq) return
    typesStatus.value = 'error'
  }
}

function toggleType(type: PokemonTypeName) {
  if (defensiveTypes.value.includes(type)) {
    defensiveTypes.value = defensiveTypes.value.filter((t) => t !== type)
  } else {
    defensiveTypes.value = [...defensiveTypes.value, type]
  }
}

watch(defensiveTypes, () => {
  if (defensiveTypes.value.length > 0) void loadTypeInfo()
})

const defensiveMultipliers = computed(() =>
  computeDefensiveMultipliers(defensiveTypes.value, typeInfoMap.value),
)

const selectedResult = computed(() => {
  const found = defensiveMultipliers.value.find(
    (m) => m.type === selectedAttack.value,
  )
  return found?.multiplier ?? 1
})

const selectedClass = computed(() =>
  defensiveTone(selectedResult.value),
)

function explain(multiplier: number): string {
  if (multiplier === 0) return 'Tidak berpengaruh sama sekali (0×).'
  if (multiplier < 1)
    return `${formatMultiplier(multiplier)}× — kurang efektif, damage berkurang.`
  if (multiplier === 1) return 'Netral (1×) — damage normal.'
  if (multiplier === 2) return '2× — efektif, damage berlipat ganda.'
  return `${formatMultiplier(multiplier)}× — sangat efektif!`
}

function isSelectedType(type: PokemonTypeName): boolean {
  return type === selectedAttack.value
}
</script>

<template>
  <section aria-labelledby="type-calculator-title">
    <header class="mb-6">
      <h1
        id="type-calculator-title"
        class="text-2xl font-bold tracking-tight text-slate-900"
      >
        Type Calculator
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Pilih sebuah Pokémon sebagai pertahanan, lalu lihat seberapa efektif
        serangan dari tiap tipe terhadapnya.
      </p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-base font-bold text-slate-900">Pokémon Bertahan</h2>
        <p class="mt-1 text-xs text-slate-500">
          Pilih Pokémon. Tipe-tipenya bisa diedit di bawah bila perlu.
        </p>

        <div class="mt-4">
          <PokemonPicker
            :model-value="selectedPokemon"
            placeholder="Pilih Pokémon…"
            label="Pilih Pokémon untuk dihitung"
            @update:model-value="
              selectedPokemon = $event;
              void loadPokemon();
            "
          />
          <p v-if="pokemonStatus === 'error'" class="mt-3 text-xs text-red-600">
            Gagal memuat Pokémon. Coba pilih yang lain.
          </p>
        </div>

        <div v-if="selectedPokemon" class="mt-5">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Tipe {{ formatPokemonName(selectedPokemon.name) }}
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="type in ALL_TYPES"
              :key="type"
              type="button"
              :aria-pressed="defensiveTypes.includes(type)"
              class="rounded-full border px-3 py-1 text-xs font-semibold transition"
              :class="
                defensiveTypes.includes(type)
                  ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700'
              "
              @click="toggleType(type)"
            >
              {{ getTypeLabel(type) }}
            </button>
          </div>
          <p class="mt-3 text-xs text-slate-400">
            Klik tipe untuk menambah / menghapus tipe pertahanan.
          </p>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <h2 class="text-base font-bold text-slate-900">Hasil</h2>
        <p class="mt-1 text-xs text-slate-500">
          Pilih salah satu tipe serangan di bawah untuk melihat hasilnya.
        </p>

        <div
          v-if="selectedPokemon && defensiveTypes.length > 0"
          class="mt-4"
        >
          <div
            class="rounded-2xl px-5 py-5 text-center shadow-sm"
            :class="selectedClass"
          >
            <p class="text-sm font-semibold uppercase tracking-wide opacity-80">
              Serangan {{ getTypeLabel(selectedAttack) }}
            </p>
            <p class="mt-2 text-4xl font-extrabold leading-none">
              {{ formatMultiplier(selectedResult) }}×
            </p>
            <p class="mt-2 text-sm font-medium">
              {{ explain(selectedResult) }}
            </p>
          </div>

          <div class="mt-5 border-t border-slate-100 pt-5">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Efektivitas semua tipe terhadap Pokémon ini
            </p>
            <p
              v-if="typesStatus === 'loading' && Object.keys(typeInfoMap).length === 0"
              class="mt-3 text-xs text-slate-400"
            >
              Menghitung efektivitas tipe…
            </p>
            <ul
              v-else
              class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6"
            >
              <li v-for="item in defensiveMultipliers" :key="item.type">
                <button
                  type="button"
                  class="flex w-full flex-col items-center gap-1 rounded-xl border border-white/40 px-2 py-2 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary-300"
                  :class="[
                    defensiveTone(item.multiplier),
                    isSelectedType(item.type)
                      ? 'ring-2 ring-primary-500 ring-offset-1'
                      : '',
                  ]"
                  :title="`${getTypeLabel(item.type)}: ${formatMultiplier(item.multiplier)}×`"
                  @click="selectedAttack = item.type"
                >
                  <span class="text-xs font-semibold">
                    {{ getTypeLabel(item.type) }}
                  </span>
                  <span class="text-base font-extrabold leading-none">
                    {{ formatMultiplier(item.multiplier) }}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div
          v-else
          class="mt-8 flex flex-col items-center gap-3 text-center text-slate-400"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100"
          >
            <svg class="h-7 w-7 text-primary-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <p class="max-w-xs text-sm">
            Pilih Pokémon terlebih dahulu untuk melihat perhitungannya.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>