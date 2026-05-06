import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, radius } from '@/constants/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
};

export const TextField = forwardRef<TextInput, Props>(function TextFieldInner(
  { label, error, containerStyle, inputStyle, ...rest },
  ref,
) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, inputStyle]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    marginTop: 6,
    fontSize: 13,
  },
});
