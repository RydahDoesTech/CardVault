import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.msg}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  msg: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
