import { conditionMultiplier } from './conditionMultipliers';
import { fetchPrimaryQuote, listPricingProviders } from './registry';
import type { PriceContext, PriceQuote } from './types';

export type { PriceContext, PriceQuote, PricingProvider } from './types';
export { conditionMultiplier, fetchPrimaryQuote, listPricingProviders };

/**
 * Estimated inventory value = market (or average) * quantity, using primary quote.
 */
export async function estimateCollectionValue(
  items: {
    externalCardId: string;
    game: string;
    name: string;
    setName: string | null;
    cardNumber: string | null;
    condition: PriceContext['condition'];
    quantity: number;
  }[],
): Promise<number> {
  let total = 0;
  for (const row of items) {
    const q = await fetchPrimaryQuote({
      externalCardId: row.externalCardId,
      game: row.game,
      name: row.name,
      setName: row.setName,
      cardNumber: row.cardNumber,
      condition: row.condition,
      quantity: row.quantity,
    });
    const unit = q?.marketPrice ?? q?.averagePrice ?? 0;
    total += unit * row.quantity;
  }
  return Math.round(total * 100) / 100;
}
