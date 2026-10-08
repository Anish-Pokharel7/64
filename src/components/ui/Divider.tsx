import { View } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type DividerProps = {
  color?: string;
  vertical?: boolean;
  spacing_size?: keyof typeof spacing;
};

export function Divider({ color, vertical = false, spacing_size }: DividerProps) {
  const gap = spacing_size ? spacing[spacing_size] : spacing.md;
  return (
    <View
      style={
        vertical
          ? { width: 1, alignSelf: 'stretch', marginHorizontal: gap, backgroundColor: color ?? colors.border }
          : { height: 1, width: '100%', marginVertical: gap, backgroundColor: color ?? colors.border }
      }
    />
  );
}
