import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';

type QuantitySelectorProps = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: 'sm' | 'md' | 'lg';
};

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  size = 'md',
}: QuantitySelectorProps) {
  const dims = {
    sm: { btnSize: 32, iconSize: 16, fontSize: 14 },
    md: { btnSize: 40, iconSize: 18, fontSize: 16 },
    lg: { btnSize: 48, iconSize: 20, fontSize: 18 },
  }[size];

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrease}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        style={({ pressed }) => [
          styles.button,
          { width: dims.btnSize, height: dims.btnSize, borderRadius: dims.btnSize / 2 },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Minus size={dims.iconSize} color={colors.textPrimary} strokeWidth={2.5} />
      </Pressable>
      <Text style={[styles.quantity, { fontSize: dims.fontSize }]}>{quantity}</Text>
      <Pressable
        onPress={onIncrease}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        style={({ pressed }) => [
          styles.button,
          styles.increaseButton,
          { width: dims.btnSize, height: dims.btnSize, borderRadius: dims.btnSize / 2 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Plus size={dims.iconSize} color={colors.white} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  increaseButton: {
    backgroundColor: colors.primary,
  },
  quantity: {
    ...typography.heading3,
    color: colors.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },
});
