import type { CardSearchHit } from './types';
import type { CardSearchProvider } from './types';

/**
 * Pokémon TCG API v2 — https://docs.pokemontcg.io/
 *
 * Optional: set EXPO_PUBLIC_POKEMON_TCG_API_KEY for higher rate limits.
 * Without a key, public rate limits apply — fine for development.
 */
const BASE = 'https://api.pokemontcg.io/v2';

function mapCard(node: Record<string, unknown>): CardSearchHit {
  const images = (node.images as { small?: string; large?: string } | undefined) ?? {};
  const set = (node.set as { name?: string } | undefined) ?? {};
  return {
    externalCardId: String(node.id),
    game: 'pokemon',
    name: String(node.name ?? ''),
    setName: set.name ?? null,
    cardNumber: node.number != null ? String(node.number) : null,
    rarity: node.rarity != null ? String(node.rarity) : null,
    imageUrl: images.small ?? images.large ?? null,
    raw: node,
  };
}

export class PokemonTcgApiSearchProvider implements CardSearchProvider {
  readonly id = 'pokemon-tcg-api';

  constructor(private readonly apiKey?: string) {}

  async searchByName(query: string, options?: { limit?: number }): Promise<CardSearchHit[]> {
    const q = query.trim();
    if (!q) return [];

    const limit = options?.limit ?? 20;
    // Lucene-style: prefix search keeps results relevant for long card names
    const search = `name:${q}*`;
    const url = `${BASE}/cards?q=${encodeURIComponent(search)}&pageSize=${limit}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // TODO: add env key when you obtain one from https://dev.pokemontcg.io/
    const key = this.apiKey ?? process.env.EXPO_PUBLIC_POKEMON_TCG_API_KEY;
    if (key) {
      headers['X-Api-Key'] = key;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Pokémon TCG API error: ${res.status} ${res.statusText}`);
    }

    const body = (await res.json()) as { data?: Record<string, unknown>[] };
    const rows = body.data ?? [];
    return rows.map(mapCard);
  }
}
