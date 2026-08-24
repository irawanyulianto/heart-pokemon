import { computed, reactive, ref, watch } from 'vue'
import { tcgdexApi } from '@/services/tcgdex'
import type { TcgCard, TcgCategory } from '@/types'

/** Satu entri di dalam deck: kartu (data ramping) + jumlah salinan. */
export interface DeckCard {
  id: string
  name: string
  image: string | null
  category: TcgCategory
  count: number
  stage?: string
  rarity?: string
}

const STORAGE_KEY = 'poke-explorer:deck'
const NAME_KEY = 'poke-explorer:deck-name'
const MAX_DECK = 60
const MAX_COPIES = 4

function loadDeck(): DeckCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is DeckCard =>
        x &&
        typeof x.id === 'string' &&
        typeof x.name === 'string' &&
        typeof x.category === 'string' &&
        typeof x.count === 'number',
    )
  } catch {
    return []
  }
}

function categoryOrder(category: TcgCategory): number {
  if (category === 'Pokemon') return 0
  if (category === 'Trainer') return 1
  return 2
}

/**
 * State deck builder: menyimpan satu deck di localStorage, menerapkan aturan
 * standar (maksimal 60 kartu, maksimal 4 salinan per kartu — kecuali Energy).
 */
export function useDeckBuilder() {
  const deckName = ref(localStorage.getItem(NAME_KEY) ?? 'Deck Baru')
  const cards = reactive<Record<string, DeckCard>>({})

  for (const c of loadDeck()) cards[c.id] = c

  const entries = computed<DeckCard[]>(() =>
    Object.values(cards).sort((a, b) => {
      const o = categoryOrder(a.category) - categoryOrder(b.category)
      return o !== 0 ? o : a.name.localeCompare(b.name)
    }),
  )

  const total = computed(() =>
    entries.value.reduce((sum, c) => sum + c.count, 0),
  )
  const pokemonCount = computed(() =>
    entries.value
      .filter((c) => c.category === 'Pokemon')
      .reduce((sum, c) => sum + c.count, 0),
  )
  const trainerCount = computed(() =>
    entries.value
      .filter((c) => c.category === 'Trainer')
      .reduce((sum, c) => sum + c.count, 0),
  )
  const energyCount = computed(() =>
    entries.value
      .filter((c) => c.category === 'Energy')
      .reduce((sum, c) => sum + c.count, 0),
  )

  const isFull = computed(() => total.value >= MAX_DECK)

  function countOf(id: string): number {
    return cards[id]?.count ?? 0
  }

  function remaining(): number {
    return MAX_DECK - total.value
  }

  /** Apakah kartu masih bisa ditambahkan (belum 4 salinan / deck belum penuh). */
  function canAdd(card: TcgCard | DeckCard): boolean {
    if (total.value >= MAX_DECK) return false
    const existing = cards[card.id]
    if (
      existing &&
      existing.category !== 'Energy' &&
      existing.count >= MAX_COPIES
    ) {
      return false
    }
    return true
  }

  async function add(card: TcgCard): Promise<void> {
    if (!canAdd(card)) return
    const existing = cards[card.id]
    if (existing) {
      existing.count += 1
      return
    }
    const detailed = await tcgdexApi.getCard(card.id)
    cards[card.id] = {
      id: detailed.id,
      name: detailed.name,
      image: detailed.image,
      category: detailed.category,
      count: 1,
      stage: detailed.stage,
      rarity: detailed.rarity,
    }
  }

  function setCount(id: string, count: number): void {
    const c = cards[id]
    if (!c) return
    if (count <= 0) {
      remove(id)
      return
    }
    const others = total.value - c.count
    const room = MAX_DECK - others
    if (room <= 0) return
    if (c.category === 'Energy') {
      c.count = Math.min(count, room)
    } else {
      c.count = Math.min(count, MAX_COPIES, room)
    }
  }

  function increment(id: string): void {
    const c = cards[id]
    if (!c) return
    if (c.category !== 'Energy' && c.count >= MAX_COPIES) return
    if (total.value >= MAX_DECK) return
    c.count += 1
  }

  function decrement(id: string): void {
    const c = cards[id]
    if (!c) return
    if (c.count <= 1) {
      remove(id)
      return
    }
    c.count -= 1
  }

  function remove(id: string): void {
    delete cards[id]
  }

  function clear(): void {
    for (const key of Object.keys(cards)) delete cards[key]
  }

  watch(
    [cards, deckName],
    () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.values(cards)))
        localStorage.setItem(NAME_KEY, deckName.value)
      } catch {
        // localStorage tidak tersedia / penuh — abaikan
      }
    },
    { deep: true },
  )

  return {
    deckName,
    entries,
    total,
    pokemonCount,
    trainerCount,
    energyCount,
    isFull,
    MAX_DECK,
    MAX_COPIES,
    countOf,
    remaining,
    canAdd,
    add,
    setCount,
    increment,
    decrement,
    remove,
    clear,
  }
}
