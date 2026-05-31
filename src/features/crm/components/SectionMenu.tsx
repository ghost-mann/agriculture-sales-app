import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import type { Section } from '../store';

type Item = { key: Section; label: string; icon: keyof typeof Ionicons.glyphMap; hint?: string };

// Sections grouped the way a sales rep thinks about them, with communications
// up top since that's the day-to-day work.
const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Communications',
    items: [{ key: 'mail', label: 'Inbox', icon: 'mail-outline', hint: 'Emails — read, reply, compose' }],
  },
  {
    title: 'Pipeline',
    items: [
      { key: 'leads', label: 'Leads', icon: 'person-add-outline' },
      { key: 'opps', label: 'Opportunities', icon: 'trending-up-outline' },
      { key: 'prosp', label: 'Prospects', icon: 'business-outline' },
      { key: 'cust', label: 'Customers', icon: 'storefront-outline' },
    ],
  },
  {
    title: 'Activity',
    items: [
      { key: 'evt', label: 'Tasks & events', icon: 'checkbox-outline' },
      { key: 'act', label: 'Activity log', icon: 'pulse-outline' },
    ],
  },
  {
    title: 'Dashboard',
    items: [{ key: 'overview', label: 'Overview', icon: 'grid-outline', hint: 'KPIs & pipeline funnel' }],
  },
];

export function SectionMenu({
  visible,
  current,
  unread,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: Section;
  unread?: number;
  onSelect: (s: Section) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Sections</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={Brand.text2} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 22 }}>
          {GROUPS.map((g) => (
            <View key={g.title} style={{ gap: 8 }}>
              <Text style={styles.groupTitle}>{g.title}</Text>
              {g.items.map((it) => {
                const active = current === it.key;
                return (
                  <Pressable
                    key={it.key}
                    style={[styles.row, active && styles.rowActive]}
                    onPress={() => {
                      onSelect(it.key);
                      onClose();
                    }}>
                    <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                      <Ionicons name={it.icon} size={20} color={active ? '#fff' : Brand.maroon} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{it.label}</Text>
                      {it.hint ? <Text style={styles.rowHint}>{it.hint}</Text> : null}
                    </View>
                    {it.key === 'mail' && unread ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unread}</Text>
                      </View>
                    ) : null}
                    {active ? <Ionicons name="checkmark" size={18} color={Brand.maroon} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Brand.text },
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 12,
  },
  rowActive: { borderColor: Brand.maroon, backgroundColor: Brand.maroonSoft },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Brand.maroonSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: Brand.maroon },
  rowLabel: { fontSize: 15, fontWeight: '600', color: Brand.text },
  rowLabelActive: { color: Brand.maroon },
  rowHint: { fontSize: 12, color: Brand.text3, marginTop: 2 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: Brand.maroon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
