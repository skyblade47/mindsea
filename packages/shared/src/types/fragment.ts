export type FragmentQuality =
  | 'iron_word'
  | 'steel_word'
  | 'silver_sentence'
  | 'source_chapter'
  | 'divine_codex';

export type FragmentElement =
  | 'fire'
  | 'ice'
  | 'thunder'
  | 'light'
  | 'shadow'
  | 'earth'
  | 'wind';

export type FragmentForm =
  | 'single'
  | 'aoe'
  | 'chain'
  | 'projectile'
  | 'field'
  | 'summon';

export type FragmentMechanism =
  | 'life_steal'
  | 'shield'
  | 'purify'
  | 'resonance'
  | 'overload'
  | 'echo';

export interface Fragment {
  id: string;
  name: string;
  quality: FragmentQuality;
  type: 'element' | 'form' | 'mechanism';
  subType: string;
  carryingCapacity: number;
  description: string;
  rarity: number;
}

export interface FragmentInput {
  quality: FragmentQuality;
  elements: FragmentElement[];
  forms: FragmentForm[];
  mechanisms: FragmentMechanism[];
}