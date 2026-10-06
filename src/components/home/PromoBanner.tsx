import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';
import { spacing } from '@theme/spacing';

type PromoBannerProps = {
  title: string;
  subtitle: string;
  image: string;
  onPress?: () => void;
};

const { width: screenWidth } = Dimensions.get('window');
const bannerWidth = screenWidth - spacing.lg * 2;

export function PromoBanner({ title, subtitle, image, onPress }: PromoBannerProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.9 }]}
    >
      <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: bannerWidth,
    height: 160,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 29, 38, 0.45)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  title: {
    ...typography.heading1,
    fontSize: 24,
    color: colors.white,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
});
