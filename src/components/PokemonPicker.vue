<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePokedexStore } from '@/stores/pokedex'
import { defaultSpriteUrl } from '@/services/pokeapi'
import { formatPokemonName, pokedexNumber } from '@/utils/format'
import type { NamedPokemon } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue: NamedPokemon | null
    placeholder?: string
    label?: string
    /** Pokémon yang tidak boleh dipilih lagi (sudah dipilih di slot lain). */
    excluded?: NamedPokemon[]
    /** Saat true, memilih hasil langsung menavigasi ke halaman Pokémon. */
    navigateOnSelect?: boolean
    /**
     * Buka daftar saat fokus meski belum mengetik. Jika false, daftar hanya
     * muncul setelah ada teks ketikan (lebih hemat request API).
     */
    openOnEmptyQuery?: boolean
  }>(),
  {
    placeholder: 'Pilih Pokémon…',
    label: 'Cari Pokémon',
    excluded: () => [],
    navigateOnSelect: false,
    openOnEmptyQuery: true,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: NamedPokemon | null] }>()

const router = useRouter()
const store = usePokedexStore()
const query = ref('')
const open = ref(false)

const results = computed<NamedPokemon[]>(() => {
  const q = query.value.trim().toLowerCase()
  const all = store.allPokemon
  const excludedNames = new Set(
    props.excluded
      .filter((p) => p.id !== props.modelValue?.id)
      .map((p) => p.name),
  )
  const filtered = all.filter(
    (p) => !excludedNames.has(p.name) && (q ? p.name.includes(q) : true),
  )
  return filtered.slice(0, 60)
})

const hasQuery = computed(() => query.value.trim().length > 0)

function onFocus() {
  open.value = true
  if (props.openOnEmptyQuery && store.allPokemon.length === 0) void store.init()
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  if (store.allPokemon.length === 0) void store.init()
}

function onSelect(pokemon: NamedPokemon) {
  query.value = ''
  open.value = false
  if (props.navigateOnSelect) {
    void router.push({ name: 'pokemon', params: { id: pokemon.name } })
    return
  }
  emit('update:modelValue', pokemon)
}

function onEnter() {
  if (!props.navigateOnSelect || !open.value || results.value.length === 0) return
  onSelect(results.value[0])
}

function clear() {
  query.value = ''
  open.value = false
  emit('update:modelValue', null)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

function hideImg(event: Event) {
  ;(event.target as HTMLImageElement).style.display = 'none'
}

window.addEventListener('keydown', onKeydown)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="relative">
    <div
      v-if="modelValue"
      class="flex items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50/60 p-2 pr-2.5"
    >
      <span
        class="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white"
      >
        <svg
          class="h-6 w-6 text-primary-200"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="7" />
          <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="7" />
          <circle cx="50" cy="50" r="13" fill="#fff" stroke="currentColor" stroke-width="7" />
        </svg>
        <img
          :src="defaultSpriteUrl(modelValue.id)"
          :alt="`Sprite ${formatPokemonName(modelValue.name)}`"
          class="absolute inset-0 h-full w-full select-none object-contain"
          decoding="async"
          draggable="false"
          @error="hideImg"
        />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-slate-800">
          {{ formatPokemonName(modelValue.name) }}
        </p>
        <p class="text-xs font-semibold text-slate-400">
          {{ pokedexNumber(modelValue.id) }}
        </p>
      </div>
      <button
        type="button"
        :aria-label="`Hapus ${formatPokemonName(modelValue.name)}`"
        class="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600"
        @click="clear"
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
    </div>

    <div v-else class="relative">
      <svg
        class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="11"
          cy="11"
          r="7"
          stroke="currentColor"
          stroke-width="2"
          class="opacity-60"
        />
        <path
          d="m20 20-3.5-3.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <input
        :value="query"
        type="search"
        :placeholder="placeholder"
        :aria-label="label"
        class="w-full rounded-2xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        @input="onInput"
        @focus="onFocus"
        @keydown.enter="onEnter"
        @keydown.esc="open = false"
      />

      <Transition name="picker">
        <ul
          v-if="open && (openOnEmptyQuery || hasQuery)"
          class="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl"
          role="listbox"
        >
          <li
            v-for="item in results"
            :key="item.id"
            role="option"
            :aria-selected="false"
          >
            <button
              type="button"
              class="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-primary-50"
              @mousedown.prevent="onSelect(item)"
            >
              <span
                class="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sky-50"
              >
                <svg
                  class="h-5 w-5 text-primary-200"
                  viewBox="0 0 100 100"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="7" />
                  <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="7" />
                  <circle cx="50" cy="50" r="13" fill="#fff" stroke="currentColor" stroke-width="7" />
                </svg>
                <img
                  :src="defaultSpriteUrl(item.id)"
                  :alt="`Sprite ${formatPokemonName(item.name)}`"
                  class="absolute inset-0 h-full w-full select-none object-contain"
                  decoding="async"
                  draggable="false"
                  @error="hideImg"
                />
              </span>
              <span class="min-w-0 flex-1 truncate text-sm text-slate-700">
                {{ formatPokemonName(item.name) }}
              </span>
              <span class="shrink-0 text-xs font-semibold text-slate-400">
                {{ pokedexNumber(item.id) }}
              </span>
            </button>
          </li>
          <li
            v-if="results.length === 0"
            class="px-3 py-3 text-center text-sm text-slate-400"
          >
            Tidak ada hasil.
          </li>
        </ul>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.picker-enter-active,
.picker-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>