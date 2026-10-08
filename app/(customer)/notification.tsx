import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Bell, CheckCheck } from 'lucide-react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { shadows } from '@theme/shadows';
import { EmptyState } from '@components/ui/EmptyState';
import { Loading } from '@components/ui/Loading';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@hooks/useNotifications';
import { timeAgo } from '@utils/date';
import { Notification } from '@models/notification';

export default function NotificationsScreen() {
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const hasUnread = notifications?.some((n) => !n.isRead);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }}>
          {hasUnread && (
            <Pressable onPress={() => markAllRead.mutate()} style={styles.markAllBtn}>
              <CheckCheck size={20} color={colors.primary} strokeWidth={2} />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <Loading message="Loading notifications..." />
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={48} color={colors.textMuted} strokeWidth={1.5} />}
          title="No notifications"
          message="Your order updates and alerts will appear here."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => {
                if (!item.isRead) markRead.mutate(item.id);
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function NotificationItem({ notification, onPress }: { notification: Notification; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !notification.isRead && styles.cardUnread,
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={styles.iconBox}>
        <Bell size={20} color={notification.isRead ? colors.textMuted : colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, !notification.isRead && styles.titleUnread]}>{notification.title}</Text>
        {notification.body && <Text style={styles.body2}>{notification.body}</Text>}
        <Text style={styles.time}>{timeAgo(notification.createdAt)}</Text>
      </View>
      {!notification.isRead && <View style={styles.unreadDot} />}
    </Pressable>
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
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.heading2, fontSize: 20 },
  markAllBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  cardUnread: {
    backgroundColor: colors.primaryUltraLight,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  title: {
    ...typography.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  titleUnread: {
    fontWeight: '700',
  },
  body2: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
});
