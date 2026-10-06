import { supabase } from '@api/supabase';
import { Notification, Promotion } from '@models/notification';

function mapNotification(data: Record<string, unknown>): Notification {
  return {
    id: data.id as string,
    title: data.title as string,
    body: data.body as string | undefined,
    isRead: data.is_read as boolean,
    createdAt: data.created_at as string,
  };
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    if (!authData.user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapNotification);
  },

  async getUnreadCount(): Promise<number> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    if (!authData.user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authData.user.id)
      .eq('is_read', false);

    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  async markRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async markAllRead(): Promise<void> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    if (!authData.user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', authData.user.id)
      .eq('is_read', false);

    if (error) throw new Error(error.message);
  },

  async getPromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from('promotions')
      .select('id, title, description, image')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
