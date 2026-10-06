import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';
import { spacing } from '@theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessibleLabel?: string;
  style?: ViewStyle;
};

const baseContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: radius.md,
};

const baseText = {
  ...typography.button,
};

const variants = {
  primary: {
    containerBg: colors.primary,
    textColor: colors.white,
    indicatorColor: colors.white,
    borderColor: colors.primary,
  },
  secondary: {
    containerBg: colors.surfaceSecondary,
    textColor: colors.textPrimary,
    indicatorColor: colors.textPrimary,
    borderColor: colors.surfaceSecondary,
  },
  outline: {
    containerBg: colors.transparent,
    textColor: colors.primary,
    indicatorColor: colors.primary,
    borderColor: colors.primary,
  },
  ghost: {
    containerBg: colors.transparent,
    textColor: colors.primary,
    indicatorColor: colors.primary,
    borderColor: colors.transparent,
  },
  danger: {
    containerBg: colors.error,
    textColor: colors.white,
    indicatorColor: colors.white,
    borderColor: colors.error,
  },
} as const;

const sizes = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 13, gap: spacing.xs },
  md: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg, fontSize: 15, gap: spacing.sm },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, fontSize: 16, gap: spacing.sm },
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  accessibleLabel,
  style,
}: ButtonProps) {
  const v = variants[variant];
  const s = sizes[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibleLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        baseContainer,
        {
          backgroundColor: v.containerBg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: v.borderColor,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          opacity: isDisabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.indicatorColor} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s.gap }}>
          {leftIcon}
          <Text
            style={{
              ...baseText,
              fontSize: s.fontSize,
              color: v.textColor,
            }}
          >
            {label}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}
