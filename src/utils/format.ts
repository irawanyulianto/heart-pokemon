export function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function pokedexNumber(id: number): string {
  return `#${String(id).padStart(4, '0')}`
}

/** Ubah nama API (dengan tanda hubung) menjadi nama tampilan yang rapi. */
export function formatPokemonName(value: string): string {
  return value
    .split('-')
    .map((part) => capitalize(part))
    .join(' ')
}

/** Tinggi PokéAPI dalam desimeter → meter. */
export function formatHeight(deciMeters: number): string {
  return `${(deciMeters / 10).toFixed(1)} m`
}

/** Berat PokéAPI dalam hektogram → kilogram. */
export function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`
}

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Serangan',
  defense: 'Pertahanan',
  'special-attack': 'Serangan Khusus',
  'special-defense': 'Pertahanan Khusus',
  speed: 'Kecepatan',
}

export function statLabel(name: string): string {
  return STAT_LABELS[name] ?? capitalize(name)
}

/** Rasio gender PokéAPI (-1 = tanpa gender) menjadi teks. */
export function genderText(genderRate: number): string {
  if (genderRate === -1) return 'Tanpa gender'
  if (genderRate === 0) return '100% jantan'
  if (genderRate === 8) return '50% jantan / 50% betina'
  return `${(genderRate / 8) * 100}% betina`
}