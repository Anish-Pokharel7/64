import { Stack } from 'expo-router';
import { colors } from '@theme/colors';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="restaurant/[id]" />
      <Stack.Screen name="food/[id]" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="addresses/index" />
      <Stack.Screen name="addresses/add" />
    </Stack>
  );
}
