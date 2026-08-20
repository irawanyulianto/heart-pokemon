<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    label?: string
  }>(),
  { placeholder: 'Cari Pokémon…', label: 'Cari Pokémon' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="relative">
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
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      :aria-label="label"
      class="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-11 pr-12 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
      @input="onInput"
    />
    <button
      v-if="modelValue"
      type="button"
      :aria-label="`Hapus ${label.toLowerCase()}`"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      @click="emit('update:modelValue', '')"
    >
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 6l12 12M18 6 6 18"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* Sembunyikan tombol silang bawaan browser (webkit) agar tidak ada
   dua tanda silang: browser + tombol hapus kustom di bawah. */
input[type='search']::-webkit-search-cancel-button,
input[type='search']::-webkit-search-decoration,
input[type='search']::-webkit-search-results-button,
input[type='search']::-webkit-search-results-decoration {
  -webkit-appearance: none;
  display: none;
}
</style>