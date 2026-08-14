<script setup lang="ts">
import { computed } from 'vue'
import PokemonImage from '@/components/PokemonImage.vue'
import TypeBadge from '@/components/TypeBadge.vue'
import { capitalize, pokedexNumber } from '@/utils/format'
import type { PokemonSummary } from '@/types'

const props = defineProps<{ pokemon: PokemonSummary }>()
const emit = defineEmits<{ select: [pokemon: PokemonSummary] }>()

const name = computed(() => capitalize(props.pokemon.name))

function onClick() {
  emit('select', props.pokemon)
}
</script>

<template>
  <button
    type="button"
    class="group flex w-full flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
    :aria-label="`Lihat ${name}`"
    @click="onClick"
  >
    <div
      class="flex h-28 w-28 items-center justify-center rounded-xl bg-gradient-to-b from-sky-50 to-primary-100/40"
    >
      <PokemonImage
        :pokemon-id="pokemon.id"
        :src="pokemon.spriteUrl"
        class="transition-transform duration-200 group-hover:scale-110"
      />
    </div>
    <div class="flex flex-col items-center gap-1.5">
      <span class="text-xs font-semibold text-slate-400">
        {{ pokedexNumber(pokemon.id) }}
      </span>
      <span class="text-sm font-semibold text-slate-800">{{ name }}</span>
      <div class="flex flex-wrap justify-center gap-1.5">
        <TypeBadge
          v-for="type in pokemon.types"
          :key="type"
          :type="type"
          size="sm"
        />
      </div>
    </div>
  </button>
</template>