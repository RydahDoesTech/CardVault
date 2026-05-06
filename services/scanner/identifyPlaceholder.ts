import { getCardSearchProvider } from '@/services/cardSearch';
import type { CardSearchHit } from '@/services/cardSearch/types';

/**
 * Placeholder “OCR” pipeline — replace with on-device ML or cloud vision later.
 *
 * Candidates for native-compatible OCR / detection:
 * - @react-native-ml-kit/text-recognition (on-device)
 * - Cloud Vision via Edge Function (upload → analyze → return text)
 * - Custom ONNX model for card border detection, then crop + OCR
 *
 * Today: returns heuristic matches using the card search layer so UX stays consistent.
 */
export async function identifyCardFromImagePlaceholder(): Promise<CardSearchHit[]> {
  const provider = getCardSearchProvider();
  // Without OCR text, suggest popular picks as a stub for confirmation UX.
  return provider.searchByName('char', { limit: 8 });
}
