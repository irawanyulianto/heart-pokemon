<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    max?: number
  }>(),
  { max: 255 },
)

const percent = computed(() =>
  Math.min(100, Math.round((props.value / props.max) * 100)),
)

const tone = computed(() => {
  if (props.value >= 100) return 'bg-green-500'
  if (props.value >= 60) return 'bg-yellow-400'
  if (props.value >= 30) return 'bg-orange-400'
  return 'bg-red-400'
})
</script>

<template>
  <div class="flex items-center gap-3">
    <span
      class="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      {{ label }}
    </span>
    <span class="w-9 shrink-0 text-right text-sm font-bold text-slate-800">
      {{ value }}
    </span>
    <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="tone"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>