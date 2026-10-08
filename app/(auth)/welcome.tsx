import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { ShoppingBag, Truck, ShieldCheck, Star } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { Button } from '@components/ui/Button';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.brandName}>64 Delivery</Text>
          <Text style={styles.headline}>Good food. Delivered better.</Text>
          <Text style={styles.description}>
            Order from your favorite restaurants in Itahari. Fresh, fast, and right to your door.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem
            icon={<ShoppingBag size={22} color={colors.primary} strokeWidth={2} />}
            title="Easy Ordering"
            description="Browse and order in minutes"
          />
          <FeatureItem
            icon={<Truck size={22} color={colors.primary} strokeWidth={2} />}
            title="Fast Delivery"
            description="Hot food delivered to your door"
          />
          <FeatureItem
            icon={<ShieldCheck size={22} color={colors.primary} strokeWidth={2} />}
            title="Safe & Secure"
            description="Reliable service you can trust"
          />
          <FeatureItem
            icon={<Star size={22} color={colors.primary} strokeWidth={2} />}
            title="Top Rated"
            description="Best restaurants in town"
          />
        </View>

        <View style={styles.actions}>
          <Button
            label="Login"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
            size="lg"
          />
          <Button
            label="Create Account"
            onPress={() => router.push('/(auth)/register')}
            variant="outline"
            fullWidth
            size="lg"
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['2xl'],
  },
  logo: {
    width: 72,
    height: 72,
    tintColor: colors.primary,
  },
  brandName: {
    ...typography.display,
    fontSize: 30,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  headline: {
    ...typography.heading2,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  features: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    ...typography.heading3,
    fontSize: 16,
  },
  featureDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    marginTop: spacing.lg,
  },
});
