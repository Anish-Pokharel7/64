import { View, StyleSheet, ScrollView, Text, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, HelpCircle } from 'lucide-react-native';
import { useState } from 'react';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { radius } from '@theme/radius';
import { Button } from '@components/ui/Button';
import { useAuthStore } from '@store/auth.store';
import { supabase } from '@api/supabase';

const CATEGORIES = [
  'Missing item',
  'Wrong item',
  'Food quality',
  'Late delivery',
  'Driver issue',
  'Payment issue',
  'Refund',
  'Other',
];

export default function SupportScreen() {
  const user = useAuthStore((s) => s.user);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Missing info', 'Please fill in the subject and description.');
      return;
    }
    setSubmitting(true);
    try {
      const ticketNumber = `TK-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from('support_tickets').insert({
        ticket_number: ticketNumber,
        customer_id: user.id,
        category,
        subject: subject.trim(),
        description: description.trim(),
        status: 'open',
        priority: 'normal',
      });
      if (error) throw new Error(error.message);
      Alert.alert('Ticket Created', `Your support ticket ${ticketNumber} has been created. We will get back to you soon.`);
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}>
        <View style={styles.introCard}>
          <HelpCircle size={32} color={colors.primary} strokeWidth={2} />
          <Text style={styles.introText}>
            Having an issue with your order? Let us know and our team will help resolve it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Type</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief summary of the issue"
            placeholderTextColor={colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us more about what happened..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <Button
          label={submitting ? 'Submitting...' : 'Submit Ticket'}
          onPress={handleSubmit}
          fullWidth
          size="lg"
          disabled={submitting}
        />
      </ScrollView>
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
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.heading2, fontSize: 20 },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryUltraLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  introText: {
    flex: 1,
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 120,
  },
});
