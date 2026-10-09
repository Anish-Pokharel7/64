import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { useAuthStore } from '@store/auth.store';
import { APP_CONFIG } from '@config/app.config';

SplashScreen.preventAutoHideAsync();

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'KITCHEN_MANAGER', 'OPERATIONS_MANAGER', 'SUPPORT_AGENT', 'FINANCE_MANAGER'];

export default function SplashScreenPage() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
      if (isAuthenticated && user) {
        if (user.role === 'DRIVER') {
          router.replace('/(driver)/(tabs)');
        } else if (ADMIN_ROLES.includes(user.role)) {
          router.replace('/(admin)/(tabs)');
        } else {
          router.replace('/(customer)/(tabs)');
        }
      } else {
        router.replace('/(auth)/welcome');
      }
    }
  }, [isInitialized, isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.appName}>{APP_CONFIG.appName}</Text>
        <Text style={styles.tagline}>Good food. Delivered better.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    tintColor: colors.white,
  },
  appName: {
    ...typography.display,
    color: colors.white,
    fontSize: 32,
    marginTop: spacing.lg,
  },
  tagline: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
});
