import { conditionMultiplier } from './conditionMultipliers';
import type { PriceContext, PriceQuote, PricingProvider } from './types';

/**
 * Deterministic placeholder pricing — safe offline default.
 * Wire real providers (TCGPlayer, PriceCharting, eBay) in registry.ts when API keys exist.
 */
export class MockPricingProvider implements PricingProvider {
  readonly id = 'mock';

  async getQuote(ctx: PriceContext): Promise<PriceQuote | null> {
    const base = hashToRange(ctx.externalCardId, 5, 500);
    const mult = conditionMultiplier(ctx.condition);
    const mid = Math.round(base * mult * 100) / 100;
    const spread = Math.max(1, Math.round(mid * 0.12 * 100) / 100);
    const low = Math.max(0.01, Math.round((mid - spread) * 100) / 100);
    const high = Math.round((mid + spread) * 100) / 100;
    const checkedAt = new Date().toISOString();

    return {
      source: this.id,
      lowPrice: low,
      averagePrice: mid,
      highPrice: high,
      marketPrice: mid,
      checkedAt,
    };
  }
}

function hashToRange(key: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  const t = h / 0xffffffff;
  return min + t * (max - min);
}
