<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    showRetry?: boolean
  }>(),
  { message: 'Terjadi kesalahan saat memuat data.', showRetry: true },
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 px-6 py-10 text-center"
    role="alert"
  >
    <svg
      class="h-10 w-10 text-orange-500"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="2"
        class="opacity-30"
      />
      <path
        d="M12 8v5M12 16.5v.01"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
    <div>
      <h3 class="font-semibold text-orange-900">Ada yang salah</h3>
      <p class="mt-1 max-w-md text-sm text-orange-800">{{ message }}</p>
    </div>
    <button
      v-if="showRetry"
      type="button"
      class="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
      @click="emit('retry')"
    >
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 10a8 8 0 1 1 2 6m0 0v-4m0 4h4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Coba lagi
    </button>
  </div>
</template>