import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Brand } from '@/constants/theme';
import { Mail } from '@/features/crm/components/Mail';
import { Overview } from '@/features/crm/components/Overview';
import { SectionMenu } from '@/features/crm/components/SectionMenu';
import { SectionView } from '@/features/crm/components/SectionView';
import type { Section } from '@/features/crm/store';
import { useCrm } from '@/features/crm/store';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// Friendly section titles (match the grouped menu labels).
const TITLES: Record<Section, string> = {
  mail: 'Inbox',
  overview: 'Overview',
  leads: 'Leads',
  opps: 'Opportunities',
  prosp: 'Prospects',
  cust: 'Customers',
  evt: 'Tasks & events',
  act: 'Activity log',
};

export default function CrmTab() {
  const { identity } = useAuth();
  const { section, byKey, setSection } = useCrm();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Light poll of the inbox unread count for the section selector badge.
  useEffect(() => {
    let alive = true;
    apiGet('customer_portal.api.crm.crm_mail_data', { folder: 'inbox', tab: 'all', limit: 1 })
      .then((d) => alive && setUnread(d?.counts?.inbox_unread ?? 0))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [section]);

  // Defense in depth: non-CRM users bounced to Shop (route is also guarded server-side).
  if (!identity?.isCrm) {
    return <Redirect href="/(tabs)" />;
  }

  const state = byKey[section];

  return (
    <View style={styles.root}>
      <AppHeader title="CRM" subtitle="Sales workspace" />

      {/* Section selector — opens the grouped menu */}
      <Pressable style={styles.selector} onPress={() => setMenuOpen(true)}>
        <Ionicons name="apps-outline" size={18} color={Brand.maroon} />
        <Text style={styles.selectorLabel}>{TITLES[section]}</Text>
        <Ionicons name="chevron-down" size={16} color={Brand.maroon} />
        <View style={{ flex: 1 }} />
        {section !== 'mail' && unread > 0 ? (
          <Pressable style={styles.inboxJump} onPress={() => setSection('mail')} hitSlop={6}>
            <Ionicons name="mail" size={14} color="#fff" />
            <Text style={styles.inboxJumpText}>{unread}</Text>
          </Pressable>
        ) : null}
      </Pressable>

      {section === 'mail' ? (
        // Mail has its own folders + FlatList, so it must not sit in a ScrollView.
        <Mail />
      ) : state?.loading && !state?.data ? (
        <Center>
          <ActivityIndicator color={Brand.maroon} size="large" />
        </Center>
      ) : state?.err ? (
        <Center>
          <Text style={styles.msg}>{state.err}</Text>
        </Center>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {section === 'overview' ? (
            <Overview data={state?.data} />
          ) : (
            <SectionView section={section} data={state?.data} />
          )}
        </ScrollView>
      )}

      <SectionMenu
        visible={menuOpen}
        current={section}
        unread={unread}
        onSelect={setSection}
        onClose={() => setMenuOpen(false)}
      />
    </View>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: Brand.surface,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  selectorLabel: { fontSize: 16, fontWeight: '700', color: Brand.text },
  inboxJump: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Brand.maroon,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  inboxJumpText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  msg: { color: Brand.text3, fontSize: 14, textAlign: 'center' },
});
