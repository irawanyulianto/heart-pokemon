<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
  totalCount: number
  rangeStart: number
  rangeEnd: number
}>()

const emit = defineEmits<{ page: [value: number] }>()

/** 0 berarti pemisah elipsis. */
const pages = computed<number[]>(() => {
  const total = props.totalPages
  const current = props.page
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)
  const list: number[] = []
  if (start > 1) list.push(1, 0)
  for (let i = start; i <= end; i += 1) list.push(i)
  if (end < total) list.push(0, total)
  return list
})

function pageClass(p: number, active: boolean): string {
  if (p === 0) return 'w-6 text-center text-slate-400'
  return active
    ? 'bg-primary-500 text-white shadow-sm'
    : 'text-slate-600 hover:bg-primary-100 hover:text-primary-800'
}
</script>

<template>
  <div v-if="totalCount > 0" class="flex flex-col items-center gap-3">
    <p class="text-sm text-slate-500">
      Menampilkan {{ rangeStart }}–{{ rangeEnd }} dari
      <span class="font-semibold text-slate-700">{{ totalCount }}</span>
    </p>
    <nav class="flex items-center gap-1.5" aria-label="Paginasi">
      <button
        type="button"
        :disabled="page <= 1"
        aria-label="Halaman sebelumnya"
        class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
        @click="emit('page', page - 1)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m15 6-6 6 6 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <template v-for="p in pages" :key="p">
        <button
          v-if="p !== 0"
          type="button"
          :aria-current="p === page ? 'page' : undefined"
          :class="[
            pageClass(p, p === page),
            'flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-semibold transition',
          ]"
          @click="emit('page', p)"
        >
          {{ p }}
        </button>
        <span v-else class="w-4 text-center text-sm text-slate-400">…</span>
      </template>

      <button
        type="button"
        :disabled="page >= totalPages"
        aria-label="Halaman berikutnya"
        class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
        @click="emit('page', page + 1)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m9 6 6 6-6 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </nav>
  </div>
</template>