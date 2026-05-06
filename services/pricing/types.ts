import type { CardCondition } from '@/types';

/** One quote from a source (TCGPlayer, eBay, etc.) */
export interface PriceQuote {
  source: string;
  lowPrice: number | null;
  averagePrice: number | null;
  highPrice: number | null;
  marketPrice: number | null;
  checkedAt: string;
}

export interface PriceContext {
  /** Catalog / external id for provider-specific lookups */
  externalCardId: string;
  game: string;
  name: string;
  setName: string | null;
  cardNumber: string | null;
  condition: CardCondition;
  quantity: number;
}

export interface PricingProvider {
  readonly id: string;
  getQuote(ctx: PriceContext): Promise<PriceQuote | null>;
}
