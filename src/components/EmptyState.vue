<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
  message: 'Tidak ada data yang cocok dengan pencarianmu.',
})
</script>

<template>
  <div class="flex flex-col items-center gap-3 py-14 text-center">
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
      <svg
        class="h-8 w-8 text-primary-400"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="7" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="7" />
        <circle cx="50" cy="50" r="12" fill="#fff" stroke="currentColor" stroke-width="7" />
      </svg>
    </div>
    <p class="max-w-sm text-sm text-slate-500">{{ message }}</p>
  </div>
</template>