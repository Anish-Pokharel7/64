import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';
import { spacing } from '@theme/spacing';
import * as LucideIcons from 'lucide-react-native';
import { LucideIcon } from 'lucide-react-native';

type CategoryCardProps = {
  name: string;
  iconName: string;
  isActive?: boolean;
  onPress?: () => void;
};

export function CategoryCard({ name, iconName, isActive = false, onPress }: CategoryCardProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName] ?? LucideIcons.CircleDot;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={({ pressed }) => [
        styles.container,
        isActive && styles.active,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
        <IconComponent size={24} color={isActive ? colors.white : colors.primary} strokeWidth={2} />
      </View>
      <Text style={[styles.name, isActive && styles.activeName]} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
    gap: spacing.xs,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: colors.primary,
  },
  active: {},
  name: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  activeName: {
    color: colors.primary,
    fontWeight: '600',
  },
});
