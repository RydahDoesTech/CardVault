import { MockCardSearchProvider } from './mockProvider';
import { PokemonTcgApiSearchProvider } from './pokemonTcgApi';
import type { CardSearchProvider } from './types';

/**
 * Resolves the active card search provider.
 * EXPO_PUBLIC_USE_MOCK_CARD_SEARCH=true forces mock data (CI / offline).
 */
export function getCardSearchProvider(): CardSearchProvider {
  const forceMock = process.env.EXPO_PUBLIC_USE_MOCK_CARD_SEARCH === 'true';
  if (forceMock) {
    return new MockCardSearchProvider();
  }
  return new PokemonTcgApiSearchProvider();
}

export type { CardSearchHit, CardSearchProvider } from './types';
