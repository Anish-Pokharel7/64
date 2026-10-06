import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@schemas/auth.schema';
import { useForgotPassword } from '@hooks/useAuth';

export default function ForgotPasswordScreen() {
  const forgotMutation = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotMutation.mutate(data);
  };

  const isSent = forgotMutation.isSuccess;

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

          {isSent ? (
            <View style={styles.confirmationContainer}>
              <View style={styles.iconWrapper}>
                <CheckCircle2 size={56} color={colors.success} strokeWidth={2} />
              </View>
              <Text style={styles.title}>Check your messages</Text>
              <Text style={styles.subtitle}>
                {forgotMutation.data?.message ?? 'A password reset link has been sent.'}
              </Text>
              <Button
                label="Back to Login"
                onPress={() => router.push('/(auth)/login')}
                fullWidth
                size="lg"
                style={{ marginTop: spacing['2xl'] }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.title}>Forgot password?</Text>
              <Text style={styles.subtitle}>
                Enter your email and we&apos;ll send you a link to reset your password.
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
                      leftIcon={<Mail size={20} color={colors.textMuted} strokeWidth={2} />}
                      accessibleLabel="Email address"
                    />
                  )}
                />

                {forgotMutation.isError && (
                  <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
                )}

                <Button
                  label={forgotMutation.isPending ? 'Sending...' : 'Send Reset Link'}
                  onPress={handleSubmit(onSubmit)}
                  loading={forgotMutation.isPending}
                  fullWidth
                  size="lg"
                  style={{ marginTop: spacing.md }}
                />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Remember your password? </Text>
                <Button
                  label="Login"
                  onPress={() => router.push('/(auth)/login')}
                  variant="ghost"
                  size="sm"
                  style={{ paddingHorizontal: 0 }}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    lineHeight: 20,
  },
  form: {
    marginTop: spacing['2xl'],
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
  confirmationContainer: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  iconWrapper: {
    marginBottom: spacing.lg,
  },
});
