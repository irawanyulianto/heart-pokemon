<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const isHome = computed(() => route.name === 'home')
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main
      :class="[
        'mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6',
        isHome ? 'pb-8 pt-0' : 'py-8',
      ]"
    >
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>