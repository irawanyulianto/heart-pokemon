<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { formatPokemonName } from '@/utils/format'
import type { TcgCard } from '@/types'

const props = defineProps<{ cards: TcgCard[] }>()

const selected = ref<TcgCard | null>(null)

function open(card: TcgCard): void {
  selected.value = card
}

function close(): void {
  selected.value = null
}

function currentFullUrl(): string {
  return selected.value ? fullUrl(selected.value) : ''
}

function currentName(): string {
  return selected.value ? formatPokemonName(selected.value.name) : ''
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}

watch(selected, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

/**
 * URL gambar di TCGdex memerlukan kualitas + ekstensi,
 * mis. `https://assets.tcgdex.net/en/base/basep/1/low.webp`.
 * `card.image` adalah basis tanpa ekstensi.
 */
function thumbUrl(card: TcgCard): string {
  return card.image ? `${card.image}/low.webp` : ''
}

function fullUrl(card: TcgCard): string {
  return card.image ? `${card.image}/high.png` : ''
}

function setId(card: TcgCard): string {
  return card.set?.id ?? card.id.split('-')[0]
}

function setName(card: TcgCard): string {
  return card.set?.name ?? setId(card).toUpperCase()
}
</script>

<template>
  <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    <li v-for="card in cards" :key="card.id" class="flex flex-col gap-2">
      <button
        v-if="card.image"
        type="button"
        @click="open(card)"
        class="block w-full cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-0 text-left shadow-sm transition hover:shadow-md"
        :aria-label="`Perbesar kartu ${card.name}`"
      >
        <img
          :src="thumbUrl(card)"
          :alt="`Kartu ${card.name}`"
          loading="lazy"
          decoding="async"
          class="aspect-[63/88] w-full object-cover"
        />
      </button>
      <div
        v-else
        class="flex aspect-[63/88] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs font-medium text-slate-500"
      >
        {{ formatPokemonName(card.name) }}
      </div>
      <div class="px-1">
        <p class="text-sm font-semibold leading-tight text-slate-800">
          {{ formatPokemonName(card.name) }}
        </p>
        <p class="mt-0.5 text-xs leading-snug text-slate-500">
          {{ setName(card) }}
          <span v-if="card.rarity"> · {{ card.rarity }}</span>
        </p>
      </div>
    </li>
  </ul>

  <Teleport to="body">
    <div
      v-if="selected"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="`Kartu ${selected.name}`"
      @click.self="close"
    >
      <div class="relative flex max-h-full items-center">
        <img
          :src="currentFullUrl()"
          :alt="`Kartu ${currentName()}`"
          class="max-h-[85vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
        />
        <button
          type="button"
          class="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-lg transition hover:bg-slate-700"
          aria-label="Tutup popup"
          @click="close"
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
</template>