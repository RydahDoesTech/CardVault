import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  title: string;
  value: string;
  subtitle?: string;
};

export function StatCard({ title, value, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
  },
  title: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  sub: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 12,
  },
});
