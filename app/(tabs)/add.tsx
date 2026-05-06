import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { CARD_CONDITIONS } from '@/constants/conditions';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { saveCardToCollection } from '@/lib/collection';
import { getCardSearchProvider } from '@/services/cardSearch';
import type { CardSearchHit } from '@/services/cardSearch/types';
import type { CardCondition } from '@/types';

type Step = 'search' | 'details';

export default function AddCardScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ prefill?: string; scanImagePath?: string }>();

  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CardSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<CardSearchHit | null>(null);

  const [condition, setCondition] = useState<CardCondition>('Near Mint');
  const [quantity, setQuantity] = useState('1');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [storedScanPath, setStoredScanPath] = useState<string | null>(null);

  useEffect(() => {
    if (typeof params.scanImagePath === 'string' && params.scanImagePath.length > 0) {
      setStoredScanPath(params.scanImagePath);
    }
  }, [params.scanImagePath]);

  useEffect(() => {
    const raw = params.prefill;
    if (!raw || typeof raw !== 'string') return;
    try {
      const decoded = decodeURIComponent(raw);
      const hit = JSON.parse(decoded) as CardSearchHit;
      setSelected(hit);
      setStep('details');
    } catch {
      // ignore malformed deep links
    }
  }, [params.prefill]);

  async function runSearch() {
    setSearching(true);
    try {
      const provider = getCardSearchProvider();
      const hits = await provider.searchByName(query);
      setResults(hits);
    } catch (e) {
      Alert.alert('Search failed', e instanceof Error ? e.message : 'Unknown error');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function onSave() {
    if (!user || !selected) return;
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
    try {
      await saveCardToCollection({
        userId: user.id,
        hit: selected,
        condition,
        quantity: qty,
        purchasePrice: pp,
        notes: notes.trim() || null,
        frontImagePath: storedScanPath,
      });
      Alert.alert('Saved', 'Card added to your collection.');
      setStep('search');
      setSelected(null);
      setQuery('');
      setResults([]);
      setQuantity('1');
      setPurchasePrice('');
      setNotes('');
      router.push('/(tabs)');
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  if (step === 'details' && selected) {
    return (
      <Screen title="Card details" subtitle="Confirm fields before saving." scroll>
        <Text style={styles.pickTitle}>{selected.name}</Text>
        <Text style={styles.pickSub}>
          {selected.setName ?? 'Unknown set'} · #{selected.cardNumber ?? '—'}
        </Text>

        <Text style={styles.label}>Condition</Text>
        <View style={styles.condRow}>
          {CARD_CONDITIONS.map((c) => {
            const active = condition === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCondition(c)}
                style={[styles.condChip, active && styles.condChipActive]}
              >
                <Text style={[styles.condText, active && styles.condTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextField label="Quantity" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} />
        <TextField
          label="Purchase price (optional)"
          keyboardType="decimal-pad"
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          placeholder="$"
        />
        <TextField
          label="Notes (optional)"
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Centering, grading intent, etc."
        />

        <View style={styles.actions}>
          <Button title="Save to collection" onPress={() => void onSave()} loading={saving} />
          <Button
            title="Back"
            variant="secondary"
            onPress={() => {
              setStep('search');
              setSelected(null);
            }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Add card" subtitle="Search Pokémon TCG catalog." scroll={false}>
      <View style={styles.searchBody}>
      <TextField
        placeholder="Card name"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        onSubmitEditing={() => void runSearch()}
        containerStyle={{ marginBottom: spacing.sm }}
      />
      <Button title={searching ? 'Searching…' : 'Search'} onPress={() => void runSearch()} loading={searching} />

      <FlatList
        data={results}
        keyExtractor={(h) => h.externalCardId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {searching ? 'Searching…' : 'Results will show here.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setSelected(item);
              setStep('details');
            }}
            style={({ pressed }) => [styles.result, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.resultTitle}>{item.name}</Text>
            <Text style={styles.resultSub}>
              {item.setName ?? 'Set unknown'} · #{item.cardNumber ?? '—'}
            </Text>
          </Pressable>
        )}
      />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBody: {
    flex: 1,
  },
  list: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
    flexGrow: 1,
  },
  result: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  resultSub: {
    color: colors.textMuted,
    marginTop: 4,
  },
  empty: {
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  pickTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  pickSub: {
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    marginBottom: 8,
    fontSize: 13,
  },
  condRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  condChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  condChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },
  condText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  condTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
