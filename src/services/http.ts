import { apiCache } from './cache'

export const TTL = {
  MINUTE: 60_000,
  HOUR: 3_600_000,
  DAY: 86_400_000,
  WEEK: 7 * 86_400_000,
} as const

export interface FetchOptions {
  /** Masa berlaku cache dalam ms. Default 7 hari. */
  ttlMs?: number
  /** Simpan juga ke sessionStorage. Default false (hanya memori). */
  persist?: boolean
  /** Lewati cache sepenuhnya. */
  noCache?: boolean
  signal?: AbortSignal
}

export class ApiError extends Error {
  readonly status: number
  readonly url: string

  constructor(message: string, url: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.url = url
    this.status = status
  }
}

/**
 * Helper GET + JSON dengan cache di service layer.
 * Semua akses API lewat sini agar request berulang diminimalkan.
 */
export async function fetchJson<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const { ttlMs = TTL.WEEK, persist = false, noCache = false, signal } = options

  if (!noCache) {
    const cached = apiCache.get<T>(url)
    if (cached !== undefined) return cached
  }

  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }
    throw new ApiError('Tidak dapat terhubung ke server.', url, 0)
  }

  if (!response.ok) {
    throw new ApiError(
      `Gagal memuat data (HTTP ${response.status}).`,
      url,
      response.status,
    )
  }

  const data = (await response.json()) as T

  if (!noCache) {
    apiCache.set(url, data, ttlMs, persist)
  }

  return data
}