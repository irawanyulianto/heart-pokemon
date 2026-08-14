<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    compact?: boolean
  }>(),
  { message: 'Memuat data…', compact: false },
)
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 text-slate-500"
    :class="compact ? 'py-6' : 'py-14'"
    role="status"
    aria-label="Memuat"
  >
    <svg
      class="h-8 w-8 animate-spin text-primary-500"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
        class="opacity-20"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
      />
    </svg>
    <p class="text-sm">{{ message }}</p>
  </div>
</template>