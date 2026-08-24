/**
 * URL gambar di TCGdex memerlukan kualitas + ekstensi,
 * mis. `https://assets.tcgdex.net/en/base/basep/1/low.webp`.
 * `card.image` adalah basis tanpa ekstensi.
 */
export function tcgThumbUrl(card: { image: string | null }): string | undefined {
  return card.image ? `${card.image}/low.webp` : undefined
}

export function tcgFullUrl(card: { image: string | null }): string | undefined {
  return card.image ? `${card.image}/high.png` : undefined
}
