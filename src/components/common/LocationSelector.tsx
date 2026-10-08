import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MapPin, ChevronDown } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';

type LocationSelectorProps = {
  label?: string;
  location: string;
  onPress?: () => void;
};

export function LocationSelector({
  label = 'Delivering to',
  location,
  onPress,
}: LocationSelectorProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Change delivery location"
      style={styles.container}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconWrapper}>
          <MapPin size={18} color={colors.primary} strokeWidth={2} />
        </View>
        <View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        </View>
      </View>
      <ChevronDown size={20} color={colors.textMuted} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  location: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 15,
    marginTop: 1,
  },
});
