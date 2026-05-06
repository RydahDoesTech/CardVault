import type { CardCondition } from '@/types';
import { supabase } from '@/lib/supabase';
import { fetchPrimaryQuote } from '@/services/pricing';
import type { CardSearchHit } from '@/services/cardSearch/types';

/**
 * Upsert catalog row then insert user-owned card + initial price snapshot.
 */
export async function saveCardToCollection(params: {
  userId: string;
  hit: CardSearchHit;
  condition: CardCondition;
  quantity: number;
  purchasePrice?: number | null;
  notes?: string | null;
  frontImagePath?: string | null;
}): Promise<{ userCardId: string }> {
  const { data: catalogUpsert, error: cErr } = await supabase
    .from('cards')
    .upsert(
      {
        external_card_id: params.hit.externalCardId,
        game: params.hit.game,
        name: params.hit.name,
        set_name: params.hit.setName,
        card_number: params.hit.cardNumber,
        rarity: params.hit.rarity,
        image_url: params.hit.imageUrl,
      },
      { onConflict: 'game,external_card_id' },
    )
    .select('id')
    .single();

  if (cErr || !catalogUpsert) {
    throw cErr ?? new Error('Failed to upsert catalog card');
  }

  const quote = await fetchPrimaryQuote({
    externalCardId: params.hit.externalCardId,
    game: params.hit.game,
    name: params.hit.name,
    setName: params.hit.setName,
    cardNumber: params.hit.cardNumber,
    condition: params.condition,
    quantity: params.quantity,
  });

  const unit =
    quote?.marketPrice ?? quote?.averagePrice ?? quote?.lowPrice ?? quote?.highPrice ?? null;
  const estimated = unit != null ? Math.round(unit * params.quantity * 100) / 100 : null;

  const { data: uc, error: uErr } = await supabase
    .from('user_cards')
    .insert({
      user_id: params.userId,
      card_id: catalogUpsert.id,
      condition: params.condition,
      quantity: params.quantity,
      purchase_price: params.purchasePrice ?? null,
      estimated_value: estimated,
      notes: params.notes ?? null,
      front_image_url: params.frontImagePath ?? null,
      last_price_update: quote?.checkedAt ?? null,
    })
    .select('id')
    .single();

  if (uErr || !uc) {
    throw uErr ?? new Error('Failed to insert user card');
  }

  if (quote) {
    await supabase.from('price_history').insert({
      user_card_id: uc.id,
      source: quote.source,
      low_price: quote.lowPrice,
      average_price: quote.averagePrice,
      high_price: quote.highPrice,
      market_price: quote.marketPrice,
      checked_at: quote.checkedAt,
    });
  }

  return { userCardId: uc.id };
}

export async function refreshUserCardPrice(params: {
  userCardId: string;
  catalog: {
    external_card_id: string;
    game: string;
    name: string;
    set_name: string | null;
    card_number: string | null;
  };
  condition: CardCondition;
  quantity: number;
}): Promise<void> {
  const quote = await fetchPrimaryQuote({
    externalCardId: params.catalog.external_card_id,
    game: params.catalog.game,
    name: params.catalog.name,
    setName: params.catalog.set_name,
    cardNumber: params.catalog.card_number,
    condition: params.condition,
    quantity: params.quantity,
  });

  if (!quote) return;

  const unit =
    quote.marketPrice ?? quote.averagePrice ?? quote.lowPrice ?? quote.highPrice ?? null;
  const estimated = unit != null ? Math.round(unit * params.quantity * 100) / 100 : null;

  await supabase
    .from('user_cards')
    .update({
      estimated_value: estimated,
      last_price_update: quote.checkedAt,
    })
    .eq('id', params.userCardId);

  await supabase.from('price_history').insert({
    user_card_id: params.userCardId,
    source: quote.source,
    low_price: quote.lowPrice,
    average_price: quote.averagePrice,
    high_price: quote.highPrice,
    market_price: quote.marketPrice,
    checked_at: quote.checkedAt,
  });
}
