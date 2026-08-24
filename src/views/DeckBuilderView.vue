<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { tcgdexApi } from '@/services/tcgdex'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { useDeckBuilder } from '@/composables/useDeckBuilder'
import type { DeckCard } from '@/composables/useDeckBuilder'
import { tcgThumbUrl, tcgFullUrl } from '@/utils/tcg'
import SearchBar from '@/components/SearchBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import type { TcgCard, TcgCardDetailed, TcgCategory } from '@/types'

const {
  deckName,
  entries,
  total,
  pokemonCount,
  trainerCount,
  energyCount,
  isFull,
  MAX_DECK,
  MAX_COPIES,
  countOf,
  canAdd,
  add,
  increment,
  decrement,
  remove,
  clear,
  remaining,
} = useDeckBuilder()

const query = ref('')
const debounced = useDebouncedValue(() => query.value, 350)
const category = ref<TcgCategory | null>(null)
const results = ref<TcgCard[]>([])
const searching = ref(false)
const searched = ref(false)
const copied = ref(false)
const broken = ref<Set<string>>(new Set())
const details = ref<Record<string, TcgCardDetailed>>({})
const lightbox = ref<{ src: string; name: string } | null>(null)

const categoryFilters = [
  { label: 'Semua', value: null },
  { label: 'Pokémon', value: 'Pokemon' },
  { label: 'Trainer', value: 'Trainer' },
  { label: 'Energy', value: 'Energy' },
] as const

const deckPercent = computed(() =>
  Math.min(100, Math.round((total.value / MAX_DECK) * 100)),
)

watch(
  [debounced, category],
  async () => {
    const q = debounced.value.trim()
    if (!q && !category.value) {
      results.value = []
      searched.value = false
      return
    }
    searching.value = true
    searched.value = true
    try {
      const list = await tcgdexApi.searchCards(q, category.value ?? undefined)
      results.value = list.slice(0, 40)
      void enrich(list)
    } catch {
      results.value = []
    } finally {
      searching.value = false
    }
  },
  { immediate: true },
)

/** Ambil detail (stage/rarity) tiap hasil sekali saja, dibatasi konkurensi. */
async function enrich(list: TcgCard[]): Promise<void> {
  const tasks = list
    .filter((c) => !details.value[c.id])
    .map(
      (c) =>
        async (): Promise<{ id: string; data: TcgCardDetailed } | null> => {
          try {
            return { id: c.id, data: await tcgdexApi.getCard(c.id) }
          } catch {
            return null
          }
        },
    )
  const acc: Record<string, TcgCardDetailed> = {}
  const settled = await runWithConcurrency(tasks, 6)
  for (const r of settled) if (r) acc[r.id] = r.data
  if (Object.keys(acc).length) details.value = { ...details.value, ...acc }
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit = 6,
): Promise<T[]> {
  const out = new Array<T>(tasks.length)
  let i = 0
  async function worker() {
    while (i < tasks.length) {
      const cur = i++
      out[cur] = await tasks[cur]()
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  )
  return out
}

function categoryBadgeClass(value: TcgCategory): string {
  if (value === 'Pokemon')
    return 'bg-sky-100 text-sky-700'
  if (value === 'Trainer')
    return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

function setCode(card: { id: string; set?: { name?: string } }): string {
  return card.set?.name ?? card.id.split('-')[0].toUpperCase()
}

function cardSubtitle(
  stage: string | undefined,
  rarity: string | undefined,
  fallback: string,
): string {
  const parts: string[] = []
  if (stage) parts.push(stage)
  if (rarity) parts.push(rarity)
  return parts.length ? parts.join(' — ') : fallback
}

function resultSubtitle(card: TcgCard): string {
  const d = details.value[card.id]
  return cardSubtitle(d?.stage, d?.rarity, setCode(card))
}

function deckSubtitle(card: DeckCard): string {
  return cardSubtitle(
    card.stage,
    card.rarity,
    card.id.split('-')[0].toUpperCase(),
  )
}

function onImgError(id: string) {
  broken.value = new Set(broken.value).add(id)
}

function openImage(card: { image: string | null; name: string }) {
  const src = tcgFullUrl(card)
  if (!src) return
  lightbox.value = { src, name: card.name }
}

function closeLightbox() {
  lightbox.value = null
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeLightbox()
}

watch(lightbox, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

async function copyDeck() {
  const lines = [
    deckName.value,
    '',
    ...entries.value.flatMap((c) =>
      c.count > 1 ? [`${c.count}x ${c.name}`] : [c.name],
    ),
    '',
    `Total: ${total.value}/${MAX_DECK}`,
  ]
  try {
    await navigator.clipboard.writeText(lines.join('\n'))
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // clipboard tidak tersedia — abaikan
  }
}
</script>

<template>
  <section aria-labelledby="deck-title">
    <header class="mb-6">
      <h1
        id="deck-title"
        class="text-2xl font-bold tracking-tight text-slate-900"
      >
        Deck Builder
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Cari kartu Pokémon TCG, susun deck hingga 60 kartu, dan simpan otomatis
        di perangkat ini. Maksimal 4 salinan tiap kartu (kecuali Energy).
      </p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
      <!-- Panel pencarian -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <SearchBar v-model="query" placeholder="Cari kartu: pikachu, spoon…" />
        <div class="-mx-1 mt-3 flex flex-wrap gap-2">
          <button
            v-for="filter in categoryFilters"
            :key="filter.label"
            type="button"
            class="rounded-full px-3 py-1.5 text-xs font-semibold transition"
            :class="
              category === filter.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'border border-slate-300 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700'
            "
            @click="category = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="mt-4 min-h-[200px]">
          <p
            v-if="searching"
            class="flex items-center gap-2 py-8 text-sm text-slate-400"
          >
            <span
              class="h-3 w-3 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
            />
            Mencari kartu…
          </p>
          <EmptyState
            v-else-if="!searched"
            message="Ketik nama kartu untuk mulai mencari."
          />
          <EmptyState
            v-else-if="results.length === 0"
            message="Tidak ada kartu yang cocok dengan pencarianmu."
          />
          <ul v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <li
              v-for="card in results"
              :key="card.id"
              class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div
                class="relative flex aspect-[2.5/3.5] items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100"
              >
                <button
                  v-if="tcgThumbUrl(card) && !broken.has(card.id)"
                  type="button"
                  class="flex h-full w-full items-center justify-center"
                  :aria-label="`Perbesar ${card.name}`"
                  @click="openImage(card)"
                >
                  <img
                    :src="tcgThumbUrl(card)"
                    :alt="card.name"
                    loading="lazy"
                    class="h-full w-full object-contain p-1"
                    @error="onImgError(card.id)"
                  />
                </button>
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center p-2"
                >
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    aria-hidden="true"
                    class="h-10 w-10 text-primary-300"
                  >
                    <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="7" />
                    <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="7" />
                    <circle cx="50" cy="50" r="12" fill="#fff" stroke="currentColor" stroke-width="7" />
                  </svg>
                </div>
                <span
                  v-if="countOf(card.id) > 0"
                  class="absolute left-1.5 top-1.5 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-bold text-white shadow"
                >
                  ×{{ countOf(card.id) }}
                </span>
              </div>
              <div class="flex flex-1 flex-col gap-1 p-2">
                <p class="line-clamp-2 text-xs font-semibold leading-tight text-slate-800">
                  {{ card.name }}
                </p>
                <p class="truncate text-[10px] text-slate-400">
                  {{ resultSubtitle(card) }}
                </p>
                <button
                  type="button"
                  :disabled="!canAdd(card)"
                  class="mt-1 inline-flex items-center justify-center gap-1 rounded-full bg-primary-500 px-2 py-1 text-xs font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  @click="add(card)"
                >
                  {{ countOf(card.id) > 0 ? 'Tambah' : '＋ Tambah' }}
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Panel deck -->
      <aside class="lg:sticky lg:top-20 lg:self-start">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <input
            v-model="deckName"
            type="text"
            :aria-label="'Nama deck'"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            placeholder="Nama deck"
          />

          <div class="mt-3">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>Total kartu</span>
              <span class="font-semibold text-slate-700">{{ total }}/{{ MAX_DECK }}</span>
            </div>
            <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-primary-500 transition-all"
                :class="isFull ? 'bg-emerald-500' : ''"
                :style="{ width: deckPercent + '%' }"
              />
            </div>
            <p
              v-if="isFull"
              class="mt-1 text-[11px] font-medium text-emerald-600"
            >
              Deck sudah penuh (60 kartu).
            </p>
            <p
              v-else
              class="mt-1 text-[11px] text-slate-400"
            >
              Sisa {{ remaining() }} kartu lagi.
            </p>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-2 text-center">
            <div class="rounded-xl bg-sky-50 py-2">
              <p class="text-sm font-bold text-sky-700">{{ pokemonCount }}</p>
              <p class="text-[10px] font-semibold text-sky-500">Pokémon</p>
            </div>
            <div class="rounded-xl bg-amber-50 py-2">
              <p class="text-sm font-bold text-amber-700">{{ trainerCount }}</p>
              <p class="text-[10px] font-semibold text-amber-500">Trainer</p>
            </div>
            <div class="rounded-xl bg-emerald-50 py-2">
              <p class="text-sm font-bold text-emerald-700">{{ energyCount }}</p>
              <p class="text-[10px] font-semibold text-emerald-500">Energy</p>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              type="button"
              :disabled="entries.length === 0"
              class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              @click="copyDeck"
            >
              {{ copied ? 'Tersalin!' : 'Salin daftar' }}
            </button>
            <button
              type="button"
              :disabled="entries.length === 0"
              class="inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              @click="clear"
            >
              Kosongkan
            </button>
          </div>

          <ul class="mt-4 space-y-2">
            <li
              v-for="card in entries"
              :key="card.id"
              class="flex items-center gap-3 rounded-xl border border-slate-200 p-2"
            >
              <div
                class="relative flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-b from-slate-50 to-slate-100"
              >
                <button
                  v-if="tcgThumbUrl(card) && !broken.has(card.id)"
                  type="button"
                  class="flex h-full w-full items-center justify-center"
                  :aria-label="`Perbesar ${card.name}`"
                  @click="openImage(card)"
                >
                  <img
                    :src="tcgThumbUrl(card)"
                    :alt="card.name"
                    loading="lazy"
                    class="h-full w-full object-contain"
                    @error="onImgError(card.id)"
                  />
                </button>
                <svg
                  v-else
                  viewBox="0 0 100 100"
                  fill="none"
                  aria-hidden="true"
                  class="h-7 w-7 text-primary-300"
                >
                  <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="7" />
                  <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="7" />
                  <circle cx="50" cy="50" r="12" fill="#fff" stroke="currentColor" stroke-width="7" />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-slate-800">
                  {{ card.name }}
                </p>
                <div class="mt-0.5 flex flex-wrap items-center gap-1">
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    :class="categoryBadgeClass(card.category)"
                  >
                    {{ card.category }}
                  </span>
                  <span class="text-[10px] text-slate-400">
                    {{ deckSubtitle(card) }}
                  </span>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  :aria-label="`Kurangi ${card.name}`"
                  class="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                  @click="decrement(card.id)"
                >
                  −
                </button>
                <span class="w-5 text-center text-sm font-bold text-slate-800">
                  {{ card.count }}
                </span>
                <button
                  type="button"
                  :aria-label="`Tambah ${card.name}`"
                  :disabled="
                    (card.category !== 'Energy' && card.count >= MAX_COPIES) ||
                    isFull
                  "
                  class="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  @click="increment(card.id)"
                >
                  +
                </button>
                <button
                  type="button"
                  :aria-label="`Hapus ${card.name}`"
                  class="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  @click="remove(card.id)"
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
                </button>
              </div>
            </li>
          </ul>

          <EmptyState
            v-if="entries.length === 0"
            message="Deck masih kosong. Cari dan tambahkan kartu di sebelah kiri."
          />
        </div>
      </aside>
    </div>

    <Teleport to="body">
      <div
        v-if="lightbox"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="`Kartu ${lightbox.name}`"
        @click.self="closeLightbox"
      >
        <div class="relative flex max-h-full items-center">
          <img
            :src="lightbox.src"
            :alt="`Kartu ${lightbox.name}`"
            class="max-h-[85vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />
          <button
            type="button"
            class="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-lg transition hover:bg-slate-700"
            aria-label="Tutup popup"
            @click="closeLightbox"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </Teleport>
  </section>
</template>
