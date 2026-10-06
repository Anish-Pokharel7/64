import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { Text } from 'react-native';

type LoadingProps = {
  message?: string;
  fullscreen?: boolean;
  size?: 'small' | 'large';
};

export function Loading({ message, fullscreen = false, size = 'large' }: LoadingProps) {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
