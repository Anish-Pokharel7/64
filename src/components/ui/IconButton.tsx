import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@theme/colors';

type IconButtonProps = {
  onPress?: () => void;
  icon: React.ReactNode;
  size?: number;
  variant?: 'default' | 'ghost' | 'outline';
  accessibleLabel: string;
  badge?: number;
};

export function IconButton({
  onPress,
  icon,
  size = 44,
  variant = 'default',
  accessibleLabel,
  badge,
}: IconButtonProps) {
  const bgColor =
    variant === 'ghost'
      ? colors.transparent
      : variant === 'outline'
      ? colors.transparent
      : colors.surfaceSecondary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibleLabel}
      style={({ pressed }) => [
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <Pressable
          disabled
          style={styles.badge}
        >
          <Badge count={badge} />
        </Pressable>
      )}
    </Pressable>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <View style={badgeStyles.container}>
      <Text style={badgeStyles.text}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});

const badgeStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
