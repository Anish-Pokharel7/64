import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { registerSchema, RegisterFormData } from '@schemas/auth.schema';
import { useRegister } from '@hooks/useAuth';

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const registerMutation = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => router.replace('/(customer)/(tabs)'),
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing['3xl'] }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.backButtonWrapper}>
            <Button
              label=""
              onPress={() => router.back()}
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />}
              style={{ paddingHorizontal: 0 }}
            />
          </View>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join 64 Delivery and start ordering today</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Aarav Sharma"
                  autoCapitalize="words"
                  error={errors.fullName?.message}
                  leftIcon={<User size={20} color={colors.textMuted} strokeWidth={2} />}
                  accessibleLabel="Full name"
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  error={errors.email?.message}
                  leftIcon={<Mail size={20} color={colors.textMuted} strokeWidth={2} />}
                  accessibleLabel="Email address"
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone"
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
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="At least 8 characters"
                  secureTextEntry={!showPassword}
                  error={errors.password?.message}
                  leftIcon={<Lock size={20} color={colors.textMuted} strokeWidth={2} />}
                  rightIcon={
                    <ToggleIcon show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                  }
                  accessibleLabel="Password"
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Re-enter password"
                  secureTextEntry={!showConfirm}
                  error={errors.confirmPassword?.message}
                  leftIcon={<Lock size={20} color={colors.textMuted} strokeWidth={2} />}
                  rightIcon={
                    <ToggleIcon show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                  }
                  accessibleLabel="Confirm password"
                />
              )}
            />

            {registerMutation.isError && (
              <Text style={styles.errorText}>
                {registerMutation.error?.message ?? 'Registration failed. Please try again.'}
              </Text>
            )}

            <Button
              label={registerMutation.isPending ? 'Creating account...' : 'Create Account'}
              onPress={handleSubmit(onSubmit)}
              loading={registerMutation.isPending}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button
              label="Login"
              onPress={() => router.push('/(auth)/login')}
              variant="ghost"
              size="sm"
              style={{ paddingHorizontal: 0 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ToggleIcon({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <View style={{ padding: spacing.xs }}>
      {show ? (
        <EyeOff size={20} color={colors.textMuted} strokeWidth={2} onPress={onToggle} />
      ) : (
        <Eye size={20} color={colors.textMuted} strokeWidth={2} onPress={onToggle} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backButtonWrapper: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  title: {
    ...typography.heading1,
    fontSize: 26,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing.xl,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: spacing['2xl'],
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
