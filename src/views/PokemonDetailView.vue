<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePokemonDetail } from '@/composables/usePokemonDetail'
import {
  computeDefensiveMultipliers,
  computeOffensiveMultipliers,
} from '@/composables/useTypeEffectiveness'
import { typeFromApiName } from '@/composables/useTypeData'
import {
  idFromUrl,
  officialArtworkShinyUrl,
  officialArtworkUrl,
} from '@/services/pokeapi'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import EmptyState from '@/components/EmptyState.vue'
import PokemonImage from '@/components/PokemonImage.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import StatBar from '@/components/StatBar.vue'
import EvolutionChain from '@/components/EvolutionChain.vue'
import TypeEffectiveness from '@/components/TypeEffectiveness.vue'
import TcgCardGrid from '@/components/TcgCardGrid.vue'
import {
  capitalize,
  formatHeight,
  formatPokemonName,
  formatWeight,
  genderText,
  pokedexNumber,
  statLabel,
} from '@/utils/format'
import type { PokemonTypeName } from '@/types'

const props = defineProps<{ id: string }>()

const {
  status,
  error,
  pokemon,
  species,
  evolution,
  evolutionStatus,
  typesStatus,
  tcgStatus,
  typeInfoMap,
  tcgCards,
  load,
} = usePokemonDetail(() => props.id)

const shiny = ref(false)
const showAllMoves = ref(false)
const effectivenessMode = ref<'defensive' | 'offensive'>('defensive')

const displayName = computed(() => {
  const s = species.value
  if (s) {
    const en = s.names.find((n) => n.language.name === 'en')
    if (en) return en.name
  }
  return pokemon.value ? formatPokemonName(pokemon.value.name) : ''
})

watch(displayName, (name) => {
  document.title = name ? `${name} · Pokémon Explorer` : 'Pokémon Explorer'
})

watch(
  () => props.id,
  () => {
    shiny.value = false
    showAllMoves.value = false
    showAllTcg.value = false
    effectivenessMode.value = 'defensive'
  },
)

const description = computed(() => {
  const s = species.value
  if (!s) return ''
  const entries = s.flavor_text_entries.filter((e) => e.language.name === 'en')
  const entry = entries[entries.length - 1]
  return entry
    ? entry.flavor_text.replace(/[\n\f]/g, ' ').replace(/\s+/g, ' ').trim()
    : ''
})

const GENERATION_LABELS: Record<string, string> = {
  'generation-i': 'Generasi I',
  'generation-ii': 'Generasi II',
  'generation-iii': 'Generasi III',
  'generation-iv': 'Generasi IV',
  'generation-v': 'Generasi V',
  'generation-vi': 'Generasi VI',
  'generation-vii': 'Generasi VII',
  'generation-viii': 'Generasi VIII',
  'generation-ix': 'Generasi IX',
}

const generation = computed(() => {
  const name = species.value?.generation?.name ?? ''
  return GENERATION_LABELS[name] ?? (name || 'Tidak diketahui')
})

const HABITAT_LABELS: Record<string, string> = {
  cave: 'Gua',
  forest: 'Hutan',
  grassland: 'Padang rumput',
  mountain: 'Gunung',
  rare: 'Langka',
  'rough-terrain': 'Medan kasar',
  sea: 'Laut',
  urban: 'Perkotaan',
  'waters-edge': 'Tepi perairan',
}

const habitat = computed(() => {
  const name = species.value?.habitat?.name
  return name ? HABITAT_LABELS[name] ?? capitalize(name) : 'Tidak diketahui'
})

const legendaryTag = computed(() => {
  if (species.value?.is_mythical) return 'Mistik'
  if (species.value?.is_legendary) return 'Legendaris'
  return ''
})

const types = computed<PokemonTypeName[]>(() =>
  (pokemon.value?.types ?? [])
    .map((t) => typeFromApiName(t.type.name))
    .filter((t): t is PokemonTypeName => t !== null),
)

const spriteSrc = computed(() => {
  if (!pokemon.value) return ''
  return shiny.value
    ? officialArtworkShinyUrl(pokemon.value.id)
    : officialArtworkUrl(pokemon.value.id)
})

const heightText = computed(() =>
  pokemon.value ? formatHeight(pokemon.value.height) : '',
)
const weightText = computed(() =>
  pokemon.value ? formatWeight(pokemon.value.weight) : '',
)
const genderTextValue = computed(() =>
  species.value ? genderText(species.value.gender_rate) : '',
)
const captureRate = computed(() => species.value?.capture_rate ?? null)

const stats = computed(() =>
  (pokemon.value?.stats ?? []).map((s) => ({
    label: statLabel(s.stat.name),
    value: s.base_stat,
  })),
)
const statsTotal = computed(() =>
  stats.value.reduce((sum, s) => sum + s.value, 0),
)

const abilities = computed(() =>
  (pokemon.value?.abilities ?? []).map((a) => ({
    name: formatPokemonName(a.ability.name),
    hidden: a.is_hidden,
  })),
)

const moves = computed(() => {
  const names = new Set<string>()
  for (const m of pokemon.value?.moves ?? []) {
    names.add(formatPokemonName(m.move.name))
  }
  return [...names].sort((a, b) => a.localeCompare(b))
})
const movesVisible = computed(() =>
  showAllMoves.value ? moves.value : moves.value.slice(0, 30),
)

const varieties = computed(() => {
  const s = species.value
  if (!s) return []
  return s.varieties.map((v) => ({
    id: idFromUrl(v.pokemon.url),
    name: formatPokemonName(v.pokemon.name),
    isDefault: v.is_default,
  }))
})
const varietiesVisible = computed(() => varieties.value.slice(0, 12))
const varietiesExtra = computed(() =>
  Math.max(0, varieties.value.length - 12),
)

const defensiveMultipliers = computed(() =>
  computeDefensiveMultipliers(types.value, typeInfoMap.value),
)
const offensiveMultipliers = computed(() =>
  computeOffensiveMultipliers(types.value, typeInfoMap.value),
)

const showAllTcg = ref(false)
const tcgVisible = computed(() => {
  const cards = tcgCards.value ?? []
  return showAllTcg.value ? cards : cards.slice(0, 12)
})
</script>

<template>
  <div v-if="status === 'loading'">
    <LoadingState message="Memuat detail Pokémon…" />
  </div>

  <ErrorState
    v-else-if="status === 'error'"
    :message="error"
    @retry="load()"
  />

  <template v-else-if="pokemon">
    <RouterLink
      to="/pokedex"
      class="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m11 5-7 7 7 7M4 12h16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Kembali ke Pokédex
    </RouterLink>

    <section
      class="mt-4 overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-sky-100 p-6 sm:p-10"
    >
      <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div class="relative mx-auto h-52 w-52 shrink-0 sm:h-64 sm:w-64">
          <PokemonImage :pokemon-id="pokemon.id" :src="spriteSrc" />
          <button
            type="button"
            class="absolute bottom-1 right-1 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:bg-white"
            :class="shiny ? 'text-amber-600' : ''"
            :aria-pressed="shiny"
            @click="shiny = !shiny"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
            </svg>
            {{ shiny ? 'Shiny' : 'Normal' }}
          </button>
        </div>

        <div class="flex-1 text-center sm:text-left">
          <div
            class="flex flex-wrap items-center justify-center gap-2 sm:justify-start"
          >
            <span class="text-sm font-bold tracking-wide text-slate-400">
              {{ pokedexNumber(pokemon.id) }}
            </span>
            <span
              v-if="legendaryTag"
              class="rounded-full bg-primary-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
            >
              {{ legendaryTag }}
            </span>
            <span
              v-if="species?.is_baby"
              class="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700"
            >
              Bayi
            </span>
          </div>

          <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {{ displayName }}
          </h1>

          <p v-if="description" class="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {{ description }}
          </p>

          <div class="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <TypeBadge v-for="type in types" :key="type" :type="type" solid />
          </div>
        </div>
      </div>

      <dl class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div
          v-for="info in [
            { label: 'Tinggi', value: heightText },
            { label: 'Berat', value: weightText },
            { label: 'Habitat', value: habitat },
            { label: 'Generasi', value: generation },
            { label: 'Gender', value: genderTextValue },
            { label: 'Tingkat Tangkap', value: captureRate?.toString() ?? '—' },
          ]"
          :key="info.label"
          class="rounded-xl border border-white/70 bg-white/70 px-3 py-2.5"
        >
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {{ info.label }}
          </dt>
          <dd class="mt-0.5 text-sm font-semibold text-slate-800">
            {{ info.value }}
          </dd>
        </div>
      </dl>
    </section>

    <section class="mt-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900">Stats Dasar</h2>
        <div class="mt-5 flex flex-col gap-3">
          <StatBar
            v-for="stat in stats"
            :key="stat.label"
            :label="stat.label"
            :value="stat.value"
          />
        </div>
        <p class="mt-4 text-sm text-slate-500">
          Total base stats:
          <span class="font-bold text-slate-800">{{ statsTotal }}</span>
        </p>
      </div>
    </section>

    <section class="mt-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900">Kemampuan</h2>
        <ul class="mt-4 flex flex-wrap gap-2">
          <li
            v-for="ability in abilities"
            :key="ability.name"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            {{ ability.name }}
            <span
              v-if="ability.hidden"
              class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700"
            >
              Tersembunyi
            </span>
          </li>
        </ul>
      </div>
    </section>

    <section v-if="varieties.length > 0" class="mt-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900">Bentuk</h2>
        <ul class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <li
            v-for="variety in varietiesVisible"
            :key="variety.id"
            class="flex flex-col items-center gap-2"
          >
            <div
              class="flex h-24 w-24 items-center justify-center rounded-xl bg-sky-50"
            >
              <PokemonImage
                :pokemon-id="variety.id"
                :src="officialArtworkUrl(variety.id)"
              />
            </div>
            <span class="text-center text-xs font-medium text-slate-700">
              {{ variety.name }}
            </span>
            <span
              v-if="variety.isDefault"
              class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
            >
              Dasar
            </span>
          </li>
        </ul>
        <p v-if="varietiesExtra" class="mt-3 text-sm text-slate-500">
          + {{ varietiesExtra }} bentuk lainnya
        </p>
      </div>
    </section>

    <section class="mt-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900">Rantai Evolusi</h2>
        <div class="mt-5">
          <LoadingState
            v-if="evolutionStatus === 'loading'"
            compact
            message="Memuat rantai evolusi…"
          />
          <ErrorState
            v-else-if="evolutionStatus === 'error'"
            :show-retry="false"
            message="Gagal memuat rantai evolusi."
          />
          <EvolutionChain
            v-else-if="evolution"
            :chain="evolution.chain"
            :current-name="pokemon.name"
          />
        </div>
      </div>
    </section>

    <section class="mt-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900">Type Effectiveness</h2>
        <div
          class="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1"
          role="tablist"
          aria-label="Mode efektivitas tipe"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="effectivenessMode === 'defensive'"
            class="rounded-full px-4 py-1.5 text-sm font-semibold transition"
            :class="
              effectivenessMode === 'defensive'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="effectivenessMode = 'defensive'"
          >
            Pertahanan
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="effectivenessMode === 'offensive'"
            class="rounded-full px-4 py-1.5 text-sm font-semibold transition"
            :class="
              effectivenessMode === 'offensive'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="effectivenessMode = 'offensive'"
          >
            Serangan
          </button>
        </div>

        <div class="mt-5">
          <LoadingState
            v-if="typesStatus === 'loading'"
            compact
            message="Menghitung efektivitas tipe…"
          />
          <ErrorState
            v-else-if="typesStatus === 'error'"
            :show-retry="false"
            message="Gagal memuat data tipe."
          />
          <TypeEffectiveness
            v-else
            :items="
              effectivenessMode === 'defensive'
                ? defensiveMultipliers
                : offensiveMultipliers
            "
            :mode="effectivenessMode"
          />
        </div>
      </div>
    </section>

    <section class="mt-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-bold text-slate-900">Jurusan (Moves)</h2>
          <button
            v-if="moves.length > 30"
            type="button"
            class="text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
            @click="showAllMoves = !showAllMoves"
          >
            {{ showAllMoves ? 'Tutup' : `Tampilkan semua (${moves.length})` }}
          </button>
        </div>
        <ul class="mt-4 flex flex-wrap gap-2">
          <li
            v-for="move in movesVisible"
            :key="move"
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {{ move }}
          </li>
        </ul>
      </div>
    </section>

    <section class="mt-10">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-bold text-slate-900">Kartu TCG</h2>
          <p class="text-sm text-slate-500">Dari TCGdex — klik untuk gambar penuh.</p>
          <button
            v-if="tcgCards && tcgCards.length > 12"
            type="button"
            class="text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
            @click="showAllTcg = !showAllTcg"
          >
            {{ showAllTcg ? 'Tutup' : `Tampilkan semua (${tcgCards.length})` }}
          </button>
        </div>
        <div class="mt-5">
          <LoadingState
            v-if="tcgStatus === 'loading'"
            compact
            message="Memuat kartu dari TCGdex…"
          />
          <ErrorState
            v-else-if="tcgStatus === 'error'"
            :show-retry="false"
            message="Gagal memuat kartu TCG."
          />
          <TcgCardGrid
            v-else-if="tcgVisible.length > 0"
            :cards="tcgVisible"
          />
          <EmptyState
            v-else
            message="Belum ada kartu TCG untuk Pokémon ini."
          />
        </div>
      </div>
    </section>
  </template>
</template>