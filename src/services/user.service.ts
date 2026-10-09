import { supabase } from '@api/supabase';
import type { User } from '@models/user';

function mapUser(data: Record<string, unknown>): User {
  return {
    id: data.id as string,
    fullName: data.full_name as string,
    email: data.email as string,
    phone: (data.phone as string) ?? '',
    avatar: data.avatar as string | undefined,
    role: data.role as User['role'],
    status: data.status as User['status'],
    isSuspended: (data.is_suspended as boolean) ?? false,
    createdAt: data.created_at as string,
  };
}

export const userService = {
  async getProfile(): Promise<User | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.session.user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapUser(data);
  },

  async updateProfile(updates: Partial<Pick<User, 'fullName' | 'phone' | 'avatar'>>): Promise<User | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error('Not authenticated');

    const updateData: Record<string, unknown> = {};
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.session.user.id)
      .select('*')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapUser(data);
  },
};
