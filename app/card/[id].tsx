import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { CARD_CONDITIONS } from '@/constants/conditions';
import { colors, spacing } from '@/constants/theme';
import { refreshUserCardPrice } from '@/lib/collection';
import { resolveStorageImageUrl } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { CardCondition } from '@/types';
import type { UserCardWithCatalog } from '@/types';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [row, setRow] = useState<UserCardWithCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);

  const [condition, setCondition] = useState<CardCondition>('Near Mint');
  const [quantity, setQuantity] = useState('1');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_cards')
      .select('*, cards(*)')
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Unable to load card', error.message);
      setRow(null);
      setLoading(false);
      return;
    }

    const r = data as UserCardWithCatalog;
    setRow(r);
    setCondition((r.condition as CardCondition) ?? 'Near Mint');
    setQuantity(String(r.quantity));
    setPurchasePrice(r.purchase_price != null ? String(r.purchase_price) : '');
    setNotes(r.notes ?? '');

    const catalogUri = r.cards?.image_url ?? null;
    const scanPath = r.front_image_url;

    if (catalogUri) {
      setFrontUrl(catalogUri);
    } else if (scanPath) {
      const signed = await resolveStorageImageUrl(scanPath);
      setFrontUrl(signed);
    } else {
      setFrontUrl(null);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave() {
    if (!row) return;
    const qty = Number.parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      Alert.alert('Invalid quantity', 'Enter a positive integer.');
      return;
    }
    const pp = purchasePrice.trim() ? Number.parseFloat(purchasePrice) : null;
    if (purchasePrice.trim() && !Number.isFinite(pp)) {
      Alert.alert('Invalid purchase price', 'Enter a number or leave blank.');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('user_cards')
      .update({
        condition,
        quantity: qty,
        purchase_price: pp,
        notes: notes.trim() || null,
      })
      .eq('id', row.id);

    setSaving(false);
    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }
    Alert.alert('Saved', 'Your changes were saved.');
    await load();
  }

  async function onRefreshPrice() {
    if (!row?.cards) return;
    setPricing(true);
    try {
      await refreshUserCardPrice({
        userCardId: row.id,
        catalog: {
          external_card_id: row.cards.external_card_id,
          game: row.cards.game,
          name: row.cards.name,
          set_name: row.cards.set_name,
          card_number: row.cards.card_number,
        },
        condition,
        quantity: Number.parseInt(quantity, 10) || row.quantity,
      });
      await load();
      Alert.alert('Updated', 'Pricing refreshed from providers.');
    } catch (e) {
      Alert.alert('Pricing failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setPricing(false);
    }
  }

  async function onDelete() {
    if (!row) return;
    Alert.alert('Remove card?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('user_cards').delete().eq('id', row.id);
          if (error) {
            Alert.alert('Delete failed', error.message);
            return;
          }
          router.back();
        },
      },
    ]);
  }

  if (loading || !row || !row.cards) {
    return (
      <Screen title="Card" subtitle={loading ? 'Loading…' : 'Not found'} scroll>
        <Text style={styles.muted}>{loading ? 'Fetching details…' : 'This card is unavailable.'}</Text>
      </Screen>
    );
  }

  const catalog = row.cards;

  return (
    <Screen scroll title={catalog.name} subtitle={`${catalog.set_name ?? 'Unknown set'} · #${catalog.card_number ?? '—'}`}>
      <View style={styles.hero}>
        {frontUrl ? (
          <Image source={{ uri: frontUrl }} style={styles.image} contentFit="contain" transition={120} />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
      </View>

      <Text style={styles.kicker}>Rarity</Text>
      <Text style={styles.value}>{catalog.rarity ?? '—'}</Text>

      <Text style={styles.kicker}>Estimated value</Text>
      <Text style={styles.valueLarge}>
        {row.estimated_value != null ? `$${row.estimated_value.toFixed(2)}` : '—'}
      </Text>
      <Text style={styles.muted}>
        Last update:{' '}
        {row.last_price_update ? new Date(row.last_price_update).toLocaleString() : 'Never'}
      </Text>

      <Text style={[styles.kicker, { marginTop: spacing.md }]}>Condition</Text>
      <View style={styles.condRow}>
        {CARD_CONDITIONS.map((c) => {
          const active = condition === c;
          return (
            <Pressable key={c} onPress={() => setCondition(c)} style={[styles.chip, active && styles.chipOn]}>
              <Text style={[styles.chipText, active && styles.chipTextOn]}>{c}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextField label="Quantity" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} />
      <TextField
        label="Purchase price"
        keyboardType="decimal-pad"
        value={purchasePrice}
        onChangeText={setPurchasePrice}
        placeholder="Optional"
      />
      <TextField label="Notes" multiline value={notes} onChangeText={setNotes} placeholder="Optional" />

      <View style={styles.actions}>
        <Button title="Save changes" onPress={() => void onSave()} loading={saving} />
        <Button
          title="Refresh estimated value"
          variant="secondary"
          onPress={() => void onRefreshPrice()}
          loading={pricing}
        />
        <Button title="Delete from collection" variant="danger" onPress={() => void onDelete()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    aspectRatio: 0.715,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  placeholder: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  valueLarge: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  muted: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 13,
  },
  condRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  chipTextOn: {
    color: colors.text,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
