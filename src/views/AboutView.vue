<script setup lang="ts">
const features = [
  {
    title: 'Pokédex Lengkap',
    description:
      'Data 1025 species dengan pencarian cepat, pagination, dan filter tipe.',
  },
  {
    title: 'Detail & Statistik',
    description:
      'Statistik base, tipe, kemampuan, daftar jurus, hingga bentuk/forms.',
  },
  {
    title: 'Rantai Evolusi',
    description: 'Lihat jalur evolusi setiap Pokémon secara visual.',
  },
  {
    title: 'Type Effectiveness',
    description:
      'Tabel kelemahan, resistensi, dan kekebalan — mode pertahanan & serangan.',
  },
  {
    title: 'Kartu TCG',
    description: 'Pratinjau kartu Pokémon TCG langsung dari TCGdex.',
  },
  {
    title: 'Popup Info Cepat',
    description:
      'Klik kartu Pokémon untuk melihat ringkasan info tanpa pindah halaman.',
  },
  {
    title: 'PWA & Offline',
    description:
      'Dapat diinstal di HP dan tetap bisa dibuka meski tanpa internet.',
  },
  {
    title: 'Caching API',
    description:
      'Respons API di-cache di browser sehingga tidak ada request berulang.',
  },
]

const techStack = [
  'Vue 3',
  'Vite',
  'TypeScript',
  'Tailwind CSS',
  'Pinia',
  'Vue Router',
  'Service Worker',
]

const dataSources = [
  { name: 'PokéAPI v2', url: 'https://pokeapi.co', note: 'Data Pokémon game' },
  { name: 'TCGdex API v2', url: 'https://tcgdex.dev', note: 'Kartu Pokémon TCG' },
  {
    name: 'PokeAPI/sprites',
    url: 'https://github.com/PokeAPI/sprites',
    note: 'Sprite & official artwork',
  },
]
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-10">
    <header class="text-center">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">
        Tentang Pokémon Explorer
      </h1>
      <p class="mx-auto mt-3 max-w-xl text-slate-600">
        Website frontend statis untuk menjelajahi dunia Pokémon: data lengkap
        dari PokéAPI dan kartu TCG dari TCGdex, tanpa backend maupun database.
      </p>
    </header>

    <section aria-labelledby="features-title">
      <h2
        id="features-title"
        class="mb-4 text-xl font-bold text-slate-900"
      >
        Fitur yang Tersedia
      </h2>
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <li
          v-for="feature in features"
          :key="feature.title"
          class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <span
            class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m5 12 5 5L20 7"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <div>
            <h3 class="text-sm font-semibold text-slate-900">
              {{ feature.title }}
            </h3>
            <p class="mt-1 text-sm leading-relaxed text-slate-500">
              {{ feature.description }}
            </p>
          </div>
        </li>
      </ul>
    </section>

    <section aria-labelledby="tech-title">
      <h2 id="tech-title" class="mb-4 text-xl font-bold text-slate-900">
        Teknologi & Sumber Data
      </h2>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold text-slate-700">Tech stack</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="tech in techStack"
            :key="tech"
            class="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-primary-700"
          >
            {{ tech }}
          </span>
        </div>
        <p class="mt-5 text-sm font-semibold text-slate-700">Sumber data</p>
        <ul class="mt-2 space-y-2">
          <li
            v-for="source in dataSources"
            :key="source.name"
            class="flex flex-wrap items-center gap-x-2 text-sm"
          >
            <a
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-primary-600 underline-offset-4 hover:underline"
            >
              {{ source.name }}
            </a>
            <span class="text-slate-500">— {{ source.note }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section aria-labelledby="author-title">
      <h2 id="author-title" class="mb-4 text-xl font-bold text-slate-900">
        Author
      </h2>
      <div class="flex flex-col items-center gap-5 rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-8 text-center shadow-sm sm:flex-row sm:text-left">
        <div
          class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-500 text-3xl font-extrabold text-white shadow-lg"
          aria-hidden="true"
        >
          IY
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-900">Irawan Yulianto</h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-600">
            Frontend developer & desainer yang tertarik pada aplikasi web yang
            cepat, ringan, dan menyenangkan digunakan.
          </p>
          <a
            href="https://irawan.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 inline-flex items-center gap-1 rounded-full bg-primary-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
          >
            irawan.vercel.app
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14 5h5v5M19 5l-8 8M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>