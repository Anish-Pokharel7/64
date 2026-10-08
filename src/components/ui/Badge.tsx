import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';
import { spacing } from '@theme/spacing';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
};

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: colors.primaryUltraLight, text: colors.primary },
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  error: { bg: colors.errorLight, text: colors.error },
  info: { bg: colors.infoLight, text: colors.info },
  neutral: { bg: colors.surfaceSecondary, text: colors.textSecondary },
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const v = variantColors[variant];
  return (
    <View style={[styles.container, { backgroundColor: v.bg }, size === 'sm' && styles.sm, size === 'md' && styles.md]}>
      <Text style={[styles.text, { color: v.text }, size === 'sm' && styles.textSm, size === 'md' && styles.textMd]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    ...typography.caption,
    fontSize: 11,
  },
  textMd: {
    ...typography.label,
  },
});
