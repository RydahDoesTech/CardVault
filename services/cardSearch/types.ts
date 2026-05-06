import type { CardGame } from '@/types';

/** Normalized hit from any card catalog API (Pokémon TCG API today, others later). */
export interface CardSearchHit {
  externalCardId: string;
  game: CardGame;
  name: string;
  setName: string | null;
  cardNumber: string | null;
  rarity: string | null;
  imageUrl: string | null;
  /** Raw payload for debugging / future providers */
  raw?: unknown;
}

export interface CardSearchProvider {
  readonly id: string;
  searchByName(query: string, options?: { game?: CardGame; limit?: number }): Promise<CardSearchHit[]>;
}
