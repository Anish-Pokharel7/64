import { Stack } from 'expo-router';
import { colors } from '@theme/colors';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="food/[id]" />
      <Stack.Screen name="combo/[id]" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order-conformation/[id]" />
      <Stack.Screen name="order-tracking/[id]" />
      <Stack.Screen name="addresses/index" />
      <Stack.Screen name="addresses/add" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="cupon" />
      <Stack.Screen name="notification" />
      <Stack.Screen name="review/[id]" />
      <Stack.Screen name="support" />
    </Stack>
  );
}
