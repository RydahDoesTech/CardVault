import type { CardCondition } from '@/types';

/** MVP heuristics — replace with market data when integrating real comps */
const MULTIPLIERS: Record<CardCondition, number> = {
  'Near Mint': 1,
  'Lightly Played': 0.88,
  'Moderately Played': 0.72,
  'Heavily Played': 0.52,
  'Damaged': 0.35,
};

export function conditionMultiplier(condition: CardCondition): number {
  return MULTIPLIERS[condition] ?? 0.85;
}
