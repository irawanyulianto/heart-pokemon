export interface TcgSet {
  id?: string
  name?: string
  series?: string
  logo?: string | null
  symbol?: string | null
}

export type TcgCategory = 'Pokemon' | 'Trainer' | 'Energy'

/** Objek kartu ramping dari endpoint list TCGdex (`/cards`). */
export interface TcgCard {
  id: string
  localId: string
  name: string
  image: string | null
  category?: TcgCategory
  hp?: number
  types?: string[]
  rarity?: string
  illustrator?: string
  set?: TcgSet
}