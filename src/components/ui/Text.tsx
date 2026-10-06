import { Text, TextStyle } from 'react-native';
import { typography } from '@theme/typography';

type TextVariant = 'display' | 'heading1' | 'heading2' | 'heading3' | 'body' | 'bodySmall' | 'caption' | 'label' | 'button';

type AppTextProps = {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  align?: 'auto' | 'left' | 'center' | 'right' | 'justify';
  numberOfLines?: number;
  style?: TextStyle;
};

export function AppText({
  children,
  variant = 'body',
  color,
  align = 'left',
  numberOfLines,
  style,
}: AppTextProps) {
  return (
    <Text
      style={{
        ...typography[variant],
        color: color ?? '#1A1D26',
        textAlign: align,
        ...(style as TextStyle),
      }}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
