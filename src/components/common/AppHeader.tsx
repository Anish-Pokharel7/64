import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: React.ReactNode;
  onBackPress?: () => void;
  transparent?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  showBack = true,
  rightIcon,
  onBackPress,
  transparent = false,
}: AppHeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: transparent ? 'transparent' : colors.surface }}>
      <View style={[styles.container, transparent && { backgroundColor: 'transparent' }]}>
        {showBack && (
          <Pressable
            onPress={() => (onBackPress ? onBackPress() : router.back())}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
        )}
        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        {!rightIcon && showBack && <View style={styles.rightPlaceholder} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.heading3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
});
