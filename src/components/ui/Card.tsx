import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { spacing } from '@theme/spacing';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  onPress?: () => void;
};

import { Pressable } from 'react-native';

export function Card({ children, style, padded = true, onPress }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          padded && styles.padded,
          pressed && { opacity: 0.85 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, padded && styles.padded, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.md,
  },
});
