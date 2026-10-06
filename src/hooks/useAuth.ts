import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '@services/auth.service';
import { useAuthStore } from '@store/auth.store';
import { useUserStore } from '@store/user.store';
import { LoginFormData, RegisterFormData, ForgotPasswordFormData } from '@schemas/auth.schema';

export function useLogin() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data.email, data.password),
    onSuccess: (response) => {
      setAuthenticated(response.user, response.token);
      setUser(response.user);
    },
  });
}

export function useRegister() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: RegisterFormData) =>
      authService.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      }),
    onSuccess: (response) => {
      setAuthenticated(response.user, response.token);
      setUser(response.user);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authService.forgotPassword(data.email),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const clearUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      clearUser(null);
    },
  });
}
