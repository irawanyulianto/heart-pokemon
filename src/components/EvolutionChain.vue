<script setup lang="ts">
import { computed } from 'vue'
import PokemonImage from '@/components/PokemonImage.vue'
import { officialArtworkUrl, idFromUrl } from '@/services/pokeapi'
import { formatPokemonName } from '@/utils/format'
import type { ChainLink, EvolutionDetail } from '@/types'

const props = defineProps<{
  chain: ChainLink
  currentName?: string
}>()

interface LevelNode {
  link: ChainLink
  id: number
  name: string
  isCurrent: boolean
}

/** Ratakan rantai evolusi ke dalam baris per tahap (BFS). */
const levels = computed<LevelNode[][]>(() => {
  const result: LevelNode[][] = []
  const queue: Array<{ link: ChainLink; depth: number }> = [
    { link: props.chain, depth: 0 },
  ]
  while (queue.length > 0) {
    const { link, depth } = queue.shift()!
    if (!result[depth]) result[depth] = []
    result[depth].push({
      link,
      id: idFromUrl(link.species.url),
      name: formatPokemonName(link.species.name),
      isCurrent: link.species.name === props.currentName,
    })
    for (const child of link.evolves_to) {
      queue.push({ link: child, depth: depth + 1 })
    }
  }
  return result
})

function evolutionText(details: EvolutionDetail[]): string | null {
  const d = details[0]
  if (!d) return null
  if (d.min_level !== null && d.min_level !== undefined) {
    return `Level ${d.min_level}`
  }
  if (d.item) return `Gunakan ${formatPokemonName(d.item.name)}`
  switch (d.trigger.name) {
    case 'trade':
      return 'Lewat tukar-menukar'
    case 'friendship':
      return 'Level up dengan persahabatan'
    case 'level-up':
      return 'Level up'
    case 'use-item':
      return 'Gunakan item khusus'
    case 'shed':
      return 'Evolusi khusus'
    case 'three-critical-hits':
      return 'Tiga critical hit beruntun'
    case 'take-damage':
      return 'Evolusi saat HP rendah'
    case 'spin':
      return 'Putar sambil bergerak'
    case 'agile-style':
    case 'strong-style':
      return 'Gunakan gaya khusus'
    case 'recoil-damage':
      return 'Evolusi setelah recoil'
    default:
      return formatPokemonName(d.trigger.name)
  }
}
</script>

<template>
  <ol
    class="flex flex-col items-center gap-3 lg:flex-row lg:items-center lg:justify-center"
  >
    <template v-for="(level, depth) in levels" :key="depth">
      <li
        class="flex flex-wrap items-stretch justify-center gap-3 lg:flex-col lg:flex-nowrap lg:items-center"
      >
        <div
          v-for="node in level"
          :key="node.id"
          class="flex w-32 flex-col items-center gap-2 rounded-2xl border bg-white p-3 shadow-sm"
          :class="
            node.isCurrent
              ? 'border-primary-400 ring-2 ring-primary-200'
              : 'border-slate-200'
          "
        >
          <div
            class="flex h-24 w-24 items-center justify-center rounded-xl bg-sky-50"
          >
            <PokemonImage
              :pokemon-id="node.id"
              :src="officialArtworkUrl(node.id)"
            />
          </div>
          <span class="text-center text-xs font-semibold text-slate-800">
            {{ node.name }}
          </span>
          <span
            v-if="evolutionText(node.link.evolution_details)"
            class="text-center text-[11px] leading-snug text-slate-500"
          >
            {{ evolutionText(node.link.evolution_details) }}
          </span>
          <span
            v-if="node.isCurrent"
            class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700"
          >
            Ini dia
          </span>
        </div>
      </li>

      <li
        v-if="depth < levels.length - 1"
        class="flex items-center text-slate-300"
        aria-hidden="true"
      >
        <svg class="h-6 w-6 lg:-rotate-90" viewBox="0 0 24 24" fill="none">
          <path
            d="m5 8 7 7 7-7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </li>
    </template>
  </ol>
</template>