import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    const res = await signIn(email.trim(), password);
    setBusy(false);
    if (res.error) {
      Alert.alert('Sign in failed', res.error);
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <Screen title="Welcome back" subtitle="Sign in to manage your collection." scroll>
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.actions}>
        <Button title="Sign in" onPress={() => void onSubmit()} loading={busy} />
        <Button
          title="Create an account"
          variant="ghost"
          onPress={() => router.push('/(auth)/signup')}
        />
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Google sign-in</Text>
        <Text style={styles.noteBody}>
          {/* Hook `supabase.auth.signInWithOAuth({ provider: 'google', ... })` once you enable Google in Supabase Auth settings and add platform OAuth client IDs. */}
          Structured for OAuth — enable Google in Supabase, then wire `signInWithOAuth` here with your iOS/Android client IDs.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  note: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  noteTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 6,
  },
  noteBody: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
