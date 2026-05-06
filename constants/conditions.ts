import type { CardCondition } from '@/types';

/** Supported grading buckets for Pokémon (extend for other TCGs later). */
export const CARD_CONDITIONS: readonly CardCondition[] = [
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
  'Damaged',
] as const;

export function isCardCondition(value: string): value is CardCondition {
  return (CARD_CONDITIONS as readonly string[]).includes(value);
}
