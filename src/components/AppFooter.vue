<template>
  <footer class="border-t border-primary-100 bg-white">
    <div
      class="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-6 sm:text-left"
    >
      <p>© {{ new Date().getFullYear() }} Pokémon Explorer.</p>
      <p>
        Design by
        <a
          href="https://irawan.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-primary-600 underline-offset-4 hover:underline"
        >
          Irawan Yulianto
        </a>
      </p>
    </div>
  </footer>
</template>