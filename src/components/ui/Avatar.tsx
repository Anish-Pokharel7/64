import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';

type AvatarProps = {
  uri?: string;
  name: string;
  size?: number;
};

export function Avatar({ uri, name, size = 48 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: '700',
  },
});
