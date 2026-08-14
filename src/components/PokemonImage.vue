<script setup lang="ts">
import { ref, watch } from 'vue'
import { defaultSpriteUrl } from '@/services/pokeapi'

const props = defineProps<{
  pokemonId: number
  src: string
  alt?: string
}>()

const currentSrc = ref(props.src)
const failed = ref(false)

watch(
  () => props.src,
  (value) => {
    currentSrc.value = value
    failed.value = false
  },
)

function onError() {
  if (!failed.value) {
    failed.value = true
    currentSrc.value = defaultSpriteUrl(props.pokemonId)
  } else {
    currentSrc.value = ''
  }
}
</script>

<template>
  <img
    v-if="currentSrc"
    :src="currentSrc"
    :alt="alt ?? `Sprite Pokémon #${pokemonId}`"
    class="h-full w-full select-none object-contain"
    loading="lazy"
    decoding="async"
    draggable="false"
    @error="onError"
  />
</template>