import { MockPricingProvider } from './mockPricing';
import type { PriceContext, PriceQuote, PricingProvider } from './types';

const mock = new MockPricingProvider();

/**
 * Register real providers when API keys and HTTP clients are ready:
 *
 * - TCGPlayer: todo — OAuth / partner API
 * - PriceCharting: todo — scrape or partner feed (respect ToS)
 * - eBay sold listings: todo — Finding/Browse APIs with app id
 * - Pokémon TCG API: todo — market prices if exposed for product ids
 */
export function listPricingProviders(): PricingProvider[] {
  const useMockOnly = process.env.EXPO_PUBLIC_USE_MOCK_PRICING === 'true';
  if (useMockOnly) {
    return [mock];
  }
  // MVP: mock first; prepend real providers here when implemented.
  return [mock];
}

/** Aggregate first successful quote in registration order */
export async function fetchPrimaryQuote(ctx: PriceContext): Promise<PriceQuote | null> {
  for (const p of listPricingProviders()) {
    try {
      const q = await p.getQuote(ctx);
      if (q) return q;
    } catch {
      // try next provider
    }
  }
  return null;
}
