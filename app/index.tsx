import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { useAuthStore } from '@store/auth.store';
import { Text } from 'react-native';
import { APP_CONFIG } from '@config/app.config';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenPage() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
      if (isAuthenticated) {
        router.replace('/(customer)/(tabs)');
      } else {
        router.replace('/(auth)/welcome');
      }
    }
  }, [isInitialized, isAuthenticated]);

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
