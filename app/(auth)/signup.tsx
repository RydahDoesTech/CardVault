import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    const res = await signUp(email.trim(), password, displayName.trim() || undefined);
    setBusy(false);
    if (res.error) {
      Alert.alert('Sign up failed', res.error);
      return;
    }
    Alert.alert('Check your email', 'Confirm your address if your project requires email verification.');
    router.replace('/(tabs)');
  }

  return (
    <Screen title="Create account" subtitle="Start cataloging your cards." scroll>
      <TextField label="Display name (optional)" value={displayName} onChangeText={setDisplayName} />
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
        <Button title="Sign up" onPress={() => void onSubmit()} loading={busy} />
        <Button title="Back to sign in" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
