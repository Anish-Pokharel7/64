import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Home, Briefcase, MapPinned, User, Phone, MapPin, Building, Navigation } from 'lucide-react-native';
import { useState } from 'react';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { addressSchema, AddressFormData } from '@schemas/address.schema';
import { useAddAddress } from '@hooks/useAddresses';

const LABEL_OPTIONS = [
  { key: 'Home', icon: <Home size={18} color={colors.primary} strokeWidth={2} /> },
  { key: 'Office', icon: <Briefcase size={18} color={colors.primary} strokeWidth={2} /> },
  { key: 'Other', icon: <MapPinned size={18} color={colors.primary} strokeWidth={2} /> },
];

export default function AddAddressScreen() {
  const [selectedLabel, setSelectedLabel] = useState('Home');
  const addAddressMutation = useAddAddress();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'Home',
      fullName: '',
      phone: '',
      address: '',
      city: 'Itahari',
      area: '',
      landmark: '',
      isDefault: false,
    },
  });

  const onSubmit = (data: AddressFormData) => {
    addAddressMutation.mutate(
      { ...data, label: selectedLabel, isDefault: data.isDefault ?? false, landmark: data.landmark ?? '' },
      {
        onSuccess: () => router.back(),
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.title}>Add Address</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Address Label</Text>
          <View style={styles.labelOptions}>
            {LABEL_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setSelectedLabel(opt.key)}
                accessibilityRole="button"
                accessibilityLabel={opt.key}
                style={({ pressed }) => [
                  styles.labelOption,
                  selectedLabel === opt.key && styles.labelOptionActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                {opt.icon}
                <Text
                  style={[
                    styles.labelOptionText,
                    selectedLabel === opt.key && styles.labelOptionTextActive,
                  ]}
                >
                  {opt.key}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Recipient's name"
                  autoCapitalize="words"
                  error={errors.fullName?.message}
                  leftIcon={<User size={20} color={colors.textMuted} strokeWidth={2} />}
                  accessibleLabel="Full name"
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  placeholder="9801234567"
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                  leftIcon={<Phone size={20} color={colors.textMuted} strokeWidth={2} />}
                  accessibleLabel="Phone number"
                />
              )}
            />
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Street Address"
                  value={value}
                  onChangeText={onChange}
                  placeholder="House number, street name"
                  error={errors.address?.message}
                  leftIcon={<MapPin size={20} color={colors.textMuted} strokeWidth={2} />}
                  accessibleLabel="Street address"
                />
              )}
            />
            <Controller
              control={control}
              name="area"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Area / Locality"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. Main Road, Tinkune"
                  error={errors.area?.message}
                  leftIcon={<Navigation size={20} color={colors.textMuted} strokeWidth={2} />}
                  accessibleLabel="Area"
                />
              )}
            />
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="City"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Itahari"
                  error={errors.city?.message}
                  leftIcon={<Building size={20} color={colors.textMuted} strokeWidth={2} />}
                  accessibleLabel="City"
                />
              )}
            />
            <Controller
              control={control}
              name="landmark"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Landmark (Optional)"
                  value={value ?? ''}
                  onChangeText={onChange}
                  placeholder="e.g. Near City Police Station"
                  leftIcon={<MapPin size={20} color={colors.textMuted} strokeWidth={2} />}
                  accessibleLabel="Landmark"
                />
              )}
            />
          </View>

          {addAddressMutation.isError && (
            <Text style={styles.errorText}>Failed to save address. Please try again.</Text>
          )}

          <Button
            label={addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
            onPress={handleSubmit(onSubmit)}
            loading={addAddressMutation.isPending}
            fullWidth
            size="lg"
            style={{ marginTop: spacing.md }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading2,
    fontSize: 20,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  labelOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  labelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.transparent,
  },
  labelOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryUltraLight,
  },
  labelOptionText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  labelOptionTextActive: {
    color: colors.primary,
  },
  form: {
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
