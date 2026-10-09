import { Stack } from 'expo-router';
import { colors } from '@theme/colors';

export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="order/[id]" />
    </Stack>
  );
}
