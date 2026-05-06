import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CardListItem } from '@/components/CardListItem';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { CARD_CONDITIONS } from '@/constants/conditions';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useCollection } from '@/hooks/useCollection';
type SortKey = 'name' | 'value' | 'newest' | 'qty';

export default function CollectionScreen() {
  const { signOut } = useAuth();
  const { items, loading, refresh } = useCollection();

  const [query, setQuery] = useState('');
  const [condition, setCondition] = useState<string>('All');
  const [sort, setSort] = useState<SortKey>('newest');

  const filtered = useMemo(() => {
    let rows = [...items];

    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) => (r.cards?.name ?? '').toLowerCase().includes(q));
    }

    if (condition !== 'All') {
      rows = rows.filter((r) => r.condition === condition);
    }

    rows.sort((a, b) => {
      if (sort === 'name') {
        return (a.cards?.name ?? '').localeCompare(b.cards?.name ?? '');
      }
      if (sort === 'value') {
        return (b.estimated_value ?? 0) - (a.estimated_value ?? 0);
      }
      if (sort === 'qty') {
        return b.quantity - a.quantity;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return rows;
  }, [items, query, condition, sort]);

  const totals = useMemo(() => {
    const valueSum = filtered.reduce((acc, r) => acc + (r.estimated_value ?? 0), 0);
    const qtySum = filtered.reduce((acc, r) => acc + r.quantity, 0);
    return { valueSum, qtySum };
  }, [filtered]);

  return (
    <Screen
      scroll={false}
      footer={
        <Button title="Sign out" variant="secondary" onPress={() => void signOut()} />
      }
    >
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        refreshing={loading}
        onRefresh={() => void refresh()}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <Text style={styles.screenTitle}>Collection</Text>
              <Pressable onPress={() => void refresh()} accessibilityRole="button">
                <Text style={styles.link}>Refresh</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Estimated value"
                value={`$${totals.valueSum.toFixed(2)}`}
                subtitle="Based on latest quotes"
              />
              <View style={{ width: spacing.sm }} />
              <StatCard title="Total cards" value={`${totals.qtySum}`} subtitle="Quantity sum" />
            </View>

            <TextField
              placeholder="Search by name"
              value={query}
              onChangeText={setQuery}
              containerStyle={{ marginBottom: spacing.sm }}
            />

            <Text style={styles.sectionLabel}>Condition</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              {['All', ...CARD_CONDITIONS].map((c) => {
                const active = condition === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCondition(c)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionLabel}>Sort</Text>
            <View style={styles.sortRow}>
              {(
                [
                  ['name', 'Name'],
                  ['value', 'Value'],
                  ['newest', 'Newest'],
                  ['qty', 'Qty'],
                ] as const
              ).map(([key, label]) => {
                const active = sort === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSort(key)}
                    style={[styles.sortChip, active && styles.sortChipActive]}
                  >
                    <Text style={[styles.sortText, active && styles.sortTextActive]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={loading ? 'Loading…' : 'No cards yet'}
            message={
              loading
                ? 'Fetching your collection.'
                : 'Add cards from the Add tab or scan them with the Scan tab.'
            }
          />
        }
        renderItem={({ item }) => (
          <CardListItem row={item} onPress={() => router.push(`/card/${item.id}`)} />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  chips: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sortChipActive: {
    borderColor: colors.accent,
  },
  sortText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  sortTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
});
