import { supabase } from '@api/supabase';
import { User, AuthResponse, UserRole, UserStatus } from '@models/auth';

function mapUser(data: Record<string, unknown>): User {
  return {
    id: data.id as string,
    fullName: data.full_name as string,
    email: data.email as string,
    phone: (data.phone as string) ?? '',
    avatar: data.avatar as string | undefined,
    role: (data.role as UserRole) ?? 'CUSTOMER',
    status: (data.status as UserStatus) ?? 'ACTIVE',
    isSuspended: (data.is_suspended as boolean) ?? false,
    createdAt: data.created_at as string,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Login failed. No session returned.');

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.is_suspended) {
      await supabase.auth.signOut();
      throw new Error('Your account has been suspended. Please contact support.');
    }

    return {
      user: mapUser(profile ?? { id: data.user.id, email: data.user.email ?? email, full_name: email, created_at: new Date().toISOString() }),
      token: data.session.access_token,
    };
  },

  async register(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    if (!authData.session || !authData.user) {
      throw new Error('Registration failed. Please try again.');
    }

    await supabase.from('users').insert({
      id: authData.user.id,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      is_suspended: false,
    });

    return {
      user: {
        id: authData.user.id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        isSuspended: false,
        createdAt: new Date().toISOString(),
      },
      token: authData.session.access_token,
    };
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return {
      message: `If an account exists for ${email}, a password reset link has been sent.`,
    };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.session.user.id)
      .maybeSingle();

    if (!profile) return null;
    return mapUser(profile);
  },
};
