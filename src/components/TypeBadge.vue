<script setup lang="ts">
import { computed } from 'vue'
import { getTypeMeta } from '@/composables/useTypeData'
import type { PokemonTypeName } from '@/types'

const props = withDefaults(
  defineProps<{
    type: PokemonTypeName
    solid?: boolean
    size?: 'sm' | 'md'
  }>(),
  { solid: false, size: 'md' },
)

const meta = computed(() => getTypeMeta(props.type))

const classes = computed(() => {
  const colors = props.solid ? meta.value.solid : meta.value.badge
  const sizing =
    props.size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
  return `${colors} ${sizing}`
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-semibold uppercase tracking-wide"
    :class="classes"
  >
    {{ meta.label }}
  </span>
</template>