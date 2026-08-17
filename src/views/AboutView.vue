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

const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/irawanyulianto/',
    path: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/irawanyulianto/',
    path: 'M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334',
  },
  {
    label: 'Website',
    href: 'https://irawan.vercel.app/',
    path: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855q-.215.403-.395.872c.705.157 1.472.257 2.282.287zM4.249 3.539q.214-.577.481-1.078a7 7 0 0 1 .597-.933A7 7 0 0 0 3.051 3.05q.544.277 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9 9 0 0 1-1.565-.667A6.96 6.96 0 0 0 1.018 7.5zm1.4-2.741a12.3 12.3 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332M8.5 5.09V7.5h2.99a12.3 12.3 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.6 13.6 0 0 1 7.5 10.91V8.5zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741zm-3.282 3.696q.18.469.395.872c.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a7 7 0 0 1-.598-.933 9 9 0 0 1-.481-1.079 8.4 8.4 0 0 0-1.198.49 7 7 0 0 0 2.276 1.522zm-1.383-2.964A13.4 13.4 0 0 1 3.508 8.5h-2.49a6.96 6.96 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667m6.728 2.964a7 7 0 0 0 2.275-1.521 8.4 8.4 0 0 0-1.197-.49 9 9 0 0 1-.481 1.078 7 7 0 0 1-.597.933M8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855q.216-.403.395-.872A12.6 12.6 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.96 6.96 0 0 0 14.982 8.5h-2.49a13.4 13.4 0 0 1-.437 3.008M14.982 7.5a6.96 6.96 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008zM11.27 2.461q.266.502.482 1.078a8.4 8.4 0 0 0 1.196-.49 7 7 0 0 0-2.275-1.52c.218.283.418.597.597.932m-.488 1.343a8 8 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z',
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
          <div class="mt-3 flex items-center justify-center gap-2 sm:justify-start">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="social.label"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-primary-500 hover:text-white hover:ring-primary-500"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path :d="social.path" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>