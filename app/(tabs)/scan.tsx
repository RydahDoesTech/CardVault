import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { identifyCardFromImagePlaceholder, uploadUserCardImage } from '@/services/scanner';
import type { CardSearchHit } from '@/services/cardSearch/types';

export default function ScanScreen() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [matches, setMatches] = useState<CardSearchHit[]>([]);
  const [uploadPath, setUploadPath] = useState<string | null>(null);

  async function ensureLibraryPermission() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to upload scans.');
      return false;
    }
    return true;
  }

  async function ensureCameraPermission() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to capture scans.');
      return false;
    }
    return true;
  }

  async function handlePick(useCamera: boolean) {
    if (!user) return;

    const ok = useCamera ? await ensureCameraPermission() : await ensureLibraryPermission();
    if (!ok) return;

    setBusy(true);
    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
          });

      if (result.canceled || !result.assets?.[0]?.uri) {
        setBusy(false);
        return;
      }

      const uri = result.assets[0].uri;
      const fileName = `scan-${Date.now()}.jpg`;

      const { path } = await uploadUserCardImage({
        userId: user.id,
        localUri: uri,
        fileName,
      });

      setUploadPath(path);

      /**
       * OCR / identification placeholder — swap `identifyCardFromImagePlaceholder`
       * for a pipeline that crops the card and recognizes text set/name/number.
       */
      const hits = await identifyCardFromImagePlaceholder();
      setMatches(hits);
    } catch (e) {
      Alert.alert('Scan failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  function confirmHit(hit: CardSearchHit) {
    const encoded = encodeURIComponent(JSON.stringify(hit));
    router.push({
      pathname: '/(tabs)/add',
      params: {
        prefill: encoded,
        scanImagePath: uploadPath ?? '',
      },
    });
  }

  return (
    <Screen title="Scan" subtitle="Capture or upload — identification is a stub for now." scroll={false}>
      <View style={styles.actions}>
        <Button title="Take photo" onPress={() => void handlePick(true)} loading={busy} />
        <Button
          title="Choose from library"
          variant="secondary"
          onPress={() => void handlePick(false)}
          loading={busy}
        />
      </View>

      {uploadPath ? (
        <Text style={styles.pathNote}>Stored in Supabase Storage: {uploadPath}</Text>
      ) : (
        <Text style={styles.pathNote}>
          Images upload to the private `user-card-images` bucket under your user id.
        </Text>
      )}

      <Text style={styles.section}>Possible matches (confirm)</Text>
      <FlatList
        data={matches}
        keyExtractor={(m) => m.externalCardId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Run a scan to see suggestions.</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => confirmHit(item)} style={styles.row}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowSub}>
              {item.setName ?? 'Unknown set'} · #{item.cardNumber ?? '—'}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pathNote: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  section: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  row: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  rowSub: {
    color: colors.textMuted,
    marginTop: 4,
  },
  empty: {
    color: colors.textMuted,
  },
});
