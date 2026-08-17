/* Service worker Pokémon Explorer — PWA offline */
const CACHE_VERSION = 'v2'
const SHELL_CACHE = 'poke-explorer-shell-' + CACHE_VERSION
const API_CACHE = 'poke-explorer-api-' + CACHE_VERSION
const SPRITE_CACHE = 'poke-explorer-sprites-' + CACHE_VERSION

const SHELL_URLS = ['/', '/index.html']

const SDK_ORIGINS = ['https://pokeapi.co', 'https://api.tcgdex.net']
const SPRITE_ORIGINS = [
  'https://raw.githubusercontent.com',
  'https://cdn.jsdelivr.net',
  'https://assets.tcgdex.net',
]

function isApiRequest(url) {
  return SDK_ORIGINS.some((origin) => url.origin === origin)
}

function isSpriteRequest(url) {
  return SPRITE_ORIGINS.some((origin) => url.origin === origin)
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, API_CACHE, SPRITE_CACHE])
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !keep.has(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  /* Navigasi SPA: coba jaringan dulu, fallback ke shell. */
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          event.waitUntil(
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone())),
          )
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/index.html')),
        ),
    )
    return
  }

  /* Asset statis app (js/css/font/svg): stale-while-revalidate. */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fresh = fetch(request)
          .then((response) => {
            if (response.ok) {
              event.waitUntil(
                caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone())),
              )
            }
            return response
          })
          .catch(() => cached)
        return cached || fresh
      }),
    )
    return
  }

  /* API data: jaringan dulu (segar), offline memakai cache terakhir. */
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            event.waitUntil(
              caches.open(API_CACHE).then((cache) => cache.put(request, response.clone())),
            )
          }
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/index.html')),
        ),
    )
    return
  }

  /* Sprite & gambar: cache dulu, hemat kuota & cepat. */
  if (isSpriteRequest(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        const fresh = fetch(request).then((response) => {
          if (response.ok) {
            event.waitUntil(
              caches.open(SPRITE_CACHE).then((cache) => cache.put(request, response.clone())),
            )
          }
          return response
        })
        return fresh
      }),
    )
  }
})