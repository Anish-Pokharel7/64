import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { radius } from '@theme/radius';
import { spacing } from '@theme/spacing';

type SearchBarProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
  showClear?: boolean;
  onClear?: () => void;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search for food, restaurants...',
  onPress,
  editable = true,
  showClear = false,
  onClear,
}: SearchBarProps) {
  const isPressable = !editable || onPress;

  const inner = (
    <View style={styles.container}>
      <Search size={20} color={colors.textMuted} strokeWidth={2} />
      <Text
        style={[
          styles.text,
          !value && styles.placeholder,
        ]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      {showClear && value && value.length > 0 && (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.clearButton}
        >
          <X size={18} color={colors.textMuted} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );

  if (isPressable) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    gap: spacing.sm,
  },
  text: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  placeholder: {
    color: colors.textMuted,
  },
  clearButton: {
    padding: spacing.xs,
  },
});
