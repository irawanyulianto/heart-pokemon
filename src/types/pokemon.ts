export interface NamedAPIResource {
  name: string
  url: string
}

export interface APIResourceList<T extends NamedAPIResource = NamedAPIResource> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/** Pokémon ringkas (id + nama) untuk pemilihan/dropdown. */
export interface NamedPokemon {
  id: number
  name: string
}

/** Ringkasan ringan untuk kartu di list (hasil dari pokemon/{id}) */
export interface PokemonSummary {
  id: number
  name: string
  types: PokemonTypeName[]
  spriteUrl: string
}

export type PokemonTypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

export interface PokemonType {
  slot: number
  type: NamedAPIResource
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: NamedAPIResource
}

export interface PokemonAbility {
  is_hidden: boolean
  slot: number
  ability: NamedAPIResource
}

export interface PokemonMoveVersion {
  level_learned_at: number
  move_learn_method: NamedAPIResource
  version_group: NamedAPIResource
}

export interface PokemonMove {
  move: NamedAPIResource
  version_group_details: PokemonMoveVersion[]
}

export interface SpriteUrls {
  front_default: string | null
  front_shiny: string | null
}

export interface SpriteVersions {
  dream_world?: SpriteUrls
  home?: SpriteUrls
  'official-artwork'?: SpriteUrls
  showdown?: SpriteUrls
}

export interface PokemonSprites {
  back_default: string | null
  back_shiny: string | null
  front_default: string | null
  front_shiny: string | null
  other?: SpriteVersions
  versions?: Record<string, unknown>
}

export interface Pokemon {
  id: number
  name: string
  base_experience: number
  height: number
  weight: number
  order: number
  is_default: boolean
  abilities: PokemonAbility[]
  forms: NamedAPIResource[]
  moves: PokemonMove[]
  species: NamedAPIResource
  sprites: PokemonSprites
  stats: PokemonStat[]
  types: PokemonType[]
}

export interface FlavorTextEntry {
  flavor_text: string
  language: NamedAPIResource
  version: NamedAPIResource
}

export interface SpeciesVariety {
  is_default: boolean
  pokemon: NamedAPIResource
}

export interface PokemonSpecies {
  id: number
  name: string
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  gender_rate: number
  capture_rate: number
  hatch_counter: number
  has_gender_differences: boolean
  forms_switchable: boolean
  evolves_from_species: NamedAPIResource | null
  evolution_chain: { url: string }
  flavor_text_entries: FlavorTextEntry[]
  generation: NamedAPIResource
  habitat: NamedAPIResource | null
  names: { language: NamedAPIResource; name: string }[]
  varieties: SpeciesVariety[]
}

export interface EvolutionDetail {
  item: NamedAPIResource | null
  trigger: NamedAPIResource
  min_level: number | null
  min_affection: number | null
  min_beauty: number | null
  min_happiness: number | null
  needs_overworld_rain: boolean
  party_species: NamedAPIResource | null
  party_type: NamedAPIResource | null
  relative_physical_stats: number | null
  time_of_day: string
  trade_species: NamedAPIResource | null
  turn_upside_down: boolean
  known_move: NamedAPIResource | null
  known_move_type: NamedAPIResource | null
  location: NamedAPIResource | null
  gender: number | null
  held_item: NamedAPIResource | null
}

export interface ChainLink {
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
  is_baby: boolean
  species: NamedAPIResource
}

export interface EvolutionChain {
  id: number
  baby_trigger_item: NamedAPIResource | null
  chain: ChainLink
}

export interface TypeRelations {
  double_damage_from: NamedAPIResource[]
  double_damage_to: NamedAPIResource[]
  half_damage_from: NamedAPIResource[]
  half_damage_to: NamedAPIResource[]
  no_damage_from: NamedAPIResource[]
  no_damage_to: NamedAPIResource[]
}

export interface PokemonTypeInfo {
  id: number
  name: string
  damage_relations: TypeRelations
  pokemon: { pokemon: NamedAPIResource; slot: number }[]
}

export interface PokemonForm {
  id: number
  name: string
  form_name: string
  is_default: boolean
  is_battle_only: boolean
  is_mega: boolean
  form_order: number
  names: { language: NamedAPIResource; name: string }[]
  sprites: { front_default: string | null; front_shiny: string | null } | null
}