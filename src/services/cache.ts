interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const STORAGE_PREFIX = 'poke-explorer:cache:'

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/**
 * Cache API dengan lapisan memori (Map) + penyimpanan sesi (sessionStorage)
 * untuk item yang diminta `persist`. TTL dalam milidetik.
 */
export class ApiCache {
  private readonly memory = new Map<string, CacheEntry<unknown>>()
  private readonly storage: Storage | null

  constructor(storage: Storage | null = getSessionStorage()) {
    this.storage = storage
  }

  get<T>(key: string): T | undefined {
    const memoryEntry = this.memory.get(key)
    if (memoryEntry) {
      if (memoryEntry.expiresAt < Date.now()) {
        this.memory.delete(key)
      } else {
        return memoryEntry.value as T
      }
    }

    if (!this.storage) return undefined

    const raw = this.storage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return undefined

    try {
      const parsed = JSON.parse(raw) as CacheEntry<T>
      if (parsed.expiresAt < Date.now()) {
        this.storage.removeItem(STORAGE_PREFIX + key)
        return undefined
      }
      this.memory.set(key, parsed as CacheEntry<unknown>)
      return parsed.value
    } catch {
      this.storage.removeItem(STORAGE_PREFIX + key)
      return undefined
    }
  }

  set<T>(key: string, value: T, ttlMs: number, persist = false): void {
    const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs }
    this.memory.set(key, entry as CacheEntry<unknown>)
    if (persist && this.storage) {
      try {
        this.storage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry))
      } catch {
        // sessionStorage tidak tersedia / penuh — cukup andalkan memori
      }
    }
  }

  delete(key: string): void {
    this.memory.delete(key)
    this.storage?.removeItem(STORAGE_PREFIX + key)
  }

  clear(): void {
    this.memory.clear()
    if (!this.storage) return
    const keys: string[] = []
    for (let i = 0; i < this.storage.length; i += 1) {
      const key = this.storage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key)
    }
    for (const key of keys) this.storage.removeItem(key)
  }
}

export const apiCache = new ApiCache()