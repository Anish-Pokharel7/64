import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@hooks/useAuth';
import { LoginFormData, loginSchema } from '@schemas/auth.schema';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { router } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => router.replace('/(customer)/(tabs)'),
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.surface }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing['3xl'],
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.backButtonWrapper}>
            <Button
              label=""
              onPress={() => router.back()}
              variant="ghost"
              size="sm"
              leftIcon={
                <ChevronLeft
                  size={24}
                  color={colors.textPrimary}
                  strokeWidth={2}
                />
              }
              style={{ paddingHorizontal: 0 }}
            />
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Login to continue ordering your favorite food
          </Text>

          <View style={styles.form}>
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
                  leftIcon={
                    <Mail size={20} color={colors.textMuted} strokeWidth={2} />
                  }
                  accessibleLabel="Email address"
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
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  error={errors.password?.message}
                  leftIcon={
                    <Lock size={20} color={colors.textMuted} strokeWidth={2} />
                  }
                  rightIcon={
                    <PasswordToggle
                      show={showPassword}
                      onToggle={() => setShowPassword((prev) => !prev)}
                    />
                  }
                  accessibleLabel="Password"
                />
              )}
            />

            <View style={styles.forgotRow}>
              <Button
                label="Forgot Password?"
                onPress={() => router.push('/(auth)/forgot-password')}
                variant="ghost"
                size="sm"
                style={{ paddingHorizontal: 0 }}
              />
            </View>

            {loginMutation.isError && (
              <Text style={styles.errorText}>
                {loginMutation.error?.message ??
                  'Login failed. Please check your credentials.'}
              </Text>
            )}

            <Button
              label={loginMutation.isPending ? 'Logging in...' : 'Login'}
              onPress={handleSubmit(onSubmit)}
              loading={loginMutation.isPending}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.md }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Button
              label="Sign Up"
              onPress={() => router.push('/(auth)/register')}
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

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={{ padding: spacing.xs }}
      accessibilityRole="button"
      accessibilityLabel={show ? 'Hide password' : 'Show password'}
    >
      {show ? (
        <EyeOff size={20} color={colors.textMuted} strokeWidth={2} />
      ) : (
        <Eye size={20} color={colors.textMuted} strokeWidth={2} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButtonWrapper: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
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
    marginTop: spacing['2xl'],
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
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
