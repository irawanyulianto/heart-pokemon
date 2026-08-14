<script setup lang="ts">
import { computed } from 'vue'
import {
  defensiveTone,
  offensiveTone,
  formatMultiplier,
  type TypeMultiplier,
} from '@/composables/useTypeEffectiveness'
import { getTypeLabel } from '@/composables/useTypeData'

const props = withDefaults(
  defineProps<{
    items: TypeMultiplier[]
    mode?: 'defensive' | 'offensive'
  }>(),
  { mode: 'defensive' },
)

const title = computed(() =>
  props.mode === 'defensive'
    ? 'Kerugian yang diterima Pokémon ini'
    : 'Kerugian yang dapat diberikan ke lawan',
)

function tone(multiplier: number): string {
  return props.mode === 'defensive'
    ? defensiveTone(multiplier)
    : offensiveTone(multiplier)
}
</script>

<template>
  <div>
    <p class="mb-3 text-sm text-slate-500">{{ title }}</p>
    <ul class="grid grid-cols-3 gap-2 sm:grid-cols-6">
      <li
        v-for="item in items"
        :key="item.type"
        class="flex flex-col items-center gap-1 rounded-xl border border-white/40 px-2 py-2 shadow-sm"
        :class="tone(item.multiplier)"
        :title="`${getTypeLabel(item.type)}: ${formatMultiplier(item.multiplier)}x`"
      >
        <span class="text-xs font-semibold">{{ getTypeLabel(item.type) }}</span>
        <span class="text-base font-extrabold leading-none">
          {{ formatMultiplier(item.multiplier) }}
        </span>
      </li>
    </ul>
  </div>
</template>