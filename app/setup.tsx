import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';

/**
 * Shown when Supabase env vars are missing.
 * Fill `.env` / `app.config` extra then reload the dev client.
 */
export default function SetupScreen() {
  return (
    <Screen title="Configure CardVault" scroll>
      <View style={styles.box}>
        <Text style={styles.p}>
          Add your Supabase project credentials so authentication and storage work.
        </Text>
        <Text style={styles.mono}>
          EXPO_PUBLIC_SUPABASE_URL=...
          {'\n'}
          EXPO_PUBLIC_SUPABASE_ANON_KEY=...
        </Text>
        <Text style={styles.p}>
          Copy `.env.example` to `.env` at the project root, restart Expo with cache clear:
          `npx expo start -c`
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.md,
  },
  p: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  mono: {
    color: colors.text,
    fontFamily: 'Courier',
    fontSize: 13,
    lineHeight: 18,
  },
});
