<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const links = [
  { label: 'Beranda', to: '/' },
  { label: 'Pokédex', to: '/pokedex' },
  { label: 'Tentang', to: '/about' },
]

const route = useRoute()
const open = ref(false)

function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

watch(
  () => route.path,
  () => {
    open.value = false
  },
)
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-primary-100 bg-white/80 backdrop-blur-md"
  >
    <div
      class="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
    >
      <RouterLink to="/" class="flex items-center gap-2.5">
        <svg viewBox="0 0 100 100" class="h-9 w-9 drop-shadow-sm" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#fff" />
          <path d="M4 50 a46 46 0 0 1 92 0 z" fill="#0284c7" />
          <line x1="4" y1="50" x2="96" y2="50" stroke="#0c4a6e" stroke-width="8" />
          <circle cx="50" cy="50" r="16" fill="#fff" stroke="#0c4a6e" stroke-width="8" />
          <circle cx="50" cy="50" r="7" fill="#e0f2fe" stroke="#0c4a6e" stroke-width="3" />
        </svg>
        <span class="text-base font-bold tracking-tight text-primary-800 sm:text-lg">
          Pokémon <span class="hidden text-primary-500 sm:inline">Explorer</span>
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-0.5 md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
          :class="
            isActive(link.to)
              ? 'bg-primary-100 text-primary-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          "
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary-800 transition hover:bg-slate-100 md:hidden"
        :aria-label="open ? 'Tutup menu' : 'Buka menu'"
        :aria-expanded="open"
        @click="open = !open"
      >
        <svg
          v-if="!open"
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg
          v-else
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div
        v-if="open"
        class="absolute inset-x-0 top-16 border-t border-slate-100 bg-white/95 px-4 pb-4 pt-2 shadow-lg backdrop-blur-md md:hidden"
      >
        <nav class="flex flex-col gap-1">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-xl px-4 py-3 text-base font-medium transition-colors"
            :class="
              isActive(link.to)
                ? 'bg-primary-100 text-primary-800'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            "
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>
    </div>
  </header>
</template>