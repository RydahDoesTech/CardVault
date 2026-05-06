import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import type { UserCardWithCatalog } from '@/types';

type Props = {
  row: UserCardWithCatalog;
  onPress: () => void;
};

export function CardListItem({ row, onPress }: Props) {
  const name = row.cards?.name ?? 'Unknown card';
  const setName = row.cards?.set_name ?? '—';
  const number = row.cards?.card_number ?? '—';
  const uri = row.cards?.image_url ?? undefined;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.thumbWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.thumb} contentFit="cover" transition={120} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
          {name}
        </Text>
        <Text numberOfLines={1} style={styles.sub}>
          {setName} · #{number}
        </Text>
        <Text style={styles.detail}>
          {row.condition} · Qty {row.quantity}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>
          {row.estimated_value != null ? `$${row.estimated_value.toFixed(2)}` : '—'}
        </Text>
        <Text style={styles.small}>
          {row.last_price_update
            ? new Date(row.last_price_update).toLocaleDateString()
            : 'No price'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
  thumbWrap: {
    width: 56,
    height: 78,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    backgroundColor: colors.surfaceElevated,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },
  detail: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  small: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
