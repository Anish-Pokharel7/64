import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type ScreenContainerProps = {
  children: React.ReactNode;
  padded?: boolean;
  backgroundColor?: string;
  safeArea?: boolean;
  scrollable?: boolean;
};

export function ScreenContainer({
  children,
  padded = true,
  backgroundColor = colors.background,
  safeArea = true,
  scrollable = false,
}: ScreenContainerProps) {
  const content = scrollable ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, padding: padded ? spacing.lg : 0 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: padded ? spacing.lg : 0 }}>{children}</View>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        {content}
      </SafeAreaView>
    );
  }

  return <View style={{ flex: 1, backgroundColor }}>{content}</View>;
}
