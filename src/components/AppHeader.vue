<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const links = [
  { label: 'Beranda', to: '/' },
  { label: 'Pokédex', to: '/pokedex' },
  { label: 'Compare', to: '/compare' },
  { label: 'Type Calc', to: '/type-calculator' },
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

watch(open, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})
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
    </div>
  </header>

  <Teleport to="body">
    <Transition name="offcanvas">
      <div
        v-if="open"
        class="fixed inset-0 z-50 md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
      >
        <div
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          @click="open = false"
        />
        <div
          class="offcanvas-panel absolute inset-y-0 right-0 flex w-72 max-w-[80vw] flex-col bg-white shadow-2xl"
        >
          <div
            class="flex items-center justify-between border-b border-slate-100 px-5 py-4"
          >
            <span class="text-base font-bold tracking-tight text-primary-800">
              Menu
            </span>
            <button
              type="button"
              aria-label="Tutup menu"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              @click="open = false"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav class="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            <RouterLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors"
              :class="
                isActive(link.to)
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              "
            >
              {{ link.label }}
              <svg
                class="h-4 w-4 opacity-40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </RouterLink>
          </nav>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.offcanvas-enter-active,
.offcanvas-leave-active {
  transition: opacity 0.2s ease;
}
.offcanvas-enter-active .offcanvas-panel,
.offcanvas-leave-active .offcanvas-panel {
  transition: transform 0.25s ease;
}
.offcanvas-enter-from,
.offcanvas-leave-to {
  opacity: 0;
}
.offcanvas-enter-from .offcanvas-panel,
.offcanvas-leave-to .offcanvas-panel {
  transform: translateX(100%);
}
</style>