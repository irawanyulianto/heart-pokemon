<template>
  <section class="flex flex-col items-center gap-5 py-16 text-center">
    <div class="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
      <svg class="h-12 w-12 text-primary-400" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="7" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="7" />
        <circle cx="50" cy="50" r="12" fill="#fff" stroke="currentColor" stroke-width="7" />
      </svg>
    </div>
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">
        404 · Pokémon tidak ditemukan
      </h1>
      <p class="mt-2 text-slate-500">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
    </div>
    <RouterLink
      to="/pokedex"
      class="rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
    >
      Kembali ke Pokédex
    </RouterLink>
  </section>
</template>