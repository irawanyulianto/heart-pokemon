# Pokémon Explorer

Website frontend statis untuk menjelajahi data Pokémon, dibangun dengan **Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia + Vue Router**.

Data diambil dari:
- [PokéAPI v2](https://pokeapi.co) — data Pokémon game (detail, stats, tipe, kemampuan, jurus, rantai evolusi, type effectiveness).
- [TCGdex API v2](https://tcgdex.dev) — kartu Pokémon TCG.
- [PokeAPI/sprites](https://github.com/PokeAPI/sprites) — sprite & official artwork.

Tanpa backend dan tanpa database — semua data di-fetch dari browser dan di-cache di sisi klien agar tidak ada request berulang.

## Fitur

- Homepage dengan pencarian cepat & Pokémon populer.
- Pokédex: 1025 species, pagination, pencarian (debounce), dan filter tipe.
- Popup info cepat saat mengklik kartu Pokémon, dengan tombol menuju halaman detail (link slug, mis. `/pokemon/pikachu`).
- Halaman detail Pokémon: deskripsi, statistik (bar), kemampuan, bentuk/forms, jurus (moves), rantai evolusi, tabel type effectiveness (defense & offense), serta kartu TCG.
- Halaman **Tentang**: daftar fitur, teknologi & sumber data, serta profil author.
- Kode evaluasi **shiny** yang bisa di-toggle.
- **PWA**: dapat diinstal di HP (manifest + ikon) dan mendukung **offline** lewat service worker yang meng-cache shell aplikasi, data API, dan sprite.
- Loading state, error state dengan tombol ulangi, dan empty state.
- Caching API berlapis: memori (in-memory) + sessionStorage untuk data yang besar.
- UI modern, responsif, ringan, tema biru muda, dirancang nyaman untuk HP.

## Struktur Proyek

```
src/
├── components/    # Komponen UI & section (kartu, badge, pagination, dll)
├── composables/   # Logika reusable (debounce, type data, detail, type effectiveness)
├── layouts/       # Layout utama (header + footer + router-view)
├── router/        # Konfigurasi Vue Router
├── services/      # Klien API + caching (pokeapi, tcgdex, http, cache)
├── stores/        # State Pinia (pokedex, pokemon)
├── types/         # TypeScript types (pokemon, tcg)
├── utils/         # Helper format
└── views/         # Halaman (Home, Pokédex, Detail, 404)
```

Logika akses API terpusat di `services/` (dengan cache di `services/http.ts`), state di `stores/`, dan komponen tidak melakukan fetch langsung.

## Menjalankan Lokal

```bash
npm install
npm run dev       # development server
npm run build     # type-check (vue-tsc) + build produksi ke dist/
npm run preview   # pratinjau build produksi
```

## Deploy ke Cloudflare Pages (via GitHub)

1. Push repo ini ke GitHub.
2. Buka **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
3. Pilih repository dan isi pengaturan build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Simpan. Cloudflare Pages akan membangun setiap push.

Rute SPA (`/pokedex`, `/pokemon/pikachu`) ditangani oleh fallback SPA bawaan Cloudflare Pages (dipicu selama proyek tidak memiliki `404.html`), sehingga tidak perlu file `_redirects`. File `public/_headers` disertakan agar `sw.js` dan `manifest.webmanifest` tidak di-cache oleh CDN (update service worker langsung berlaku).

## PWA

Website ini adalah Progressive Web App:

- `public/manifest.webmanifest` — konfigurasi instalasi (nama, ikon, tema).
- `public/sw.js` — service worker dengan strategi:
  - **Network-first** untuk data API (PokéAPI & TCGdex) — segar saat online, pakai cache saat offline.
  - **Cache-first** untuk sprite/gambar — hemat kuota dan cepat.
  - **Stale-while-revalidate** untuk aset aplikasi, serta fallback SPA ke `index.html`.
- Daftar ikon dihasilkan dari `public/` (`pwa-192.png`, `pwa-512.png`, `pwa-maskable-512.png`, `apple-touch-icon.png`).
- `public/_headers` mengatur `Cache-Control: no-cache` untuk `sw.js` dan `manifest.webmanifest`.

Service worker hanya didaftarkan pada build produksi (`import.meta.env.PROD`). Konten yang pernah dibuka tetap bisa diakses saat offline.

## Catatan API

- List Pokédex menggunakan endpoint `pokemon-species` (bentuk dasar), sehingga lebih bersih daripada daftar `pokemon` yang menyertakan form/variasi.
- Endpoint list TCGdex (`/cards?name=…`) mengembalikan objek ramping (`id`, `name`, `image`); kartu ditampilkan sebagai gambar dengan fallback nama.
- Cache service default bertahan 7 hari di memori; daftar species juga dipersist ke `sessionStorage`.