import type { CardSearchHit } from './types';
import type { CardSearchProvider } from './types';

/**
 * Offline / CI fallback when Pokémon TCG API is unavailable.
 * Replace or disable via EXPO_PUBLIC_USE_MOCK_CARD_SEARCH / wiring in index.ts.
 */
export class MockCardSearchProvider implements CardSearchProvider {
  readonly id = 'mock';

  async searchByName(query: string): Promise<CardSearchHit[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const catalog: CardSearchHit[] = [
      {
        externalCardId: 'mock-base-pikachu',
        game: 'pokemon',
        name: 'Pikachu',
        setName: 'Base Set',
        cardNumber: '58/102',
        rarity: 'Common',
        imageUrl: null,
      },
      {
        externalCardId: 'mock-charizard',
        game: 'pokemon',
        name: 'Charizard',
        setName: 'Base Set',
        cardNumber: '4/102',
        rarity: 'Holo Rare',
        imageUrl: null,
      },
    ];

    return catalog.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 20);
  }
}
