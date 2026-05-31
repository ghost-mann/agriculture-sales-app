import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Brand } from '@/constants/theme';
import { Mail } from '@/features/crm/components/Mail';
import { Overview } from '@/features/crm/components/Overview';
import { SectionView } from '@/features/crm/components/SectionView';
import { SECTIONS, useCrm } from '@/features/crm/store';
import { useAuth } from '@/lib/auth';

export default function CrmTab() {
  const { identity } = useAuth();
  const { section, byKey, setSection, load } = useCrm();

  useEffect(() => {
    load('overview');
  }, [load]);

  // Defense in depth: non-CRM users bounced to Shop (route is also guarded server-side).
  if (!identity?.isCrm) {
    return <Redirect href="/(tabs)" />;
  }

  const state = byKey[section];

  return (
    <View style={styles.root}>
      <AppHeader title="CRM" subtitle="Sales pipeline" />

      {/* Section switcher */}
      <View style={styles.switcherWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcher}>
          {SECTIONS.map((s) => (
            <Pressable
              key={s.key}
              style={[styles.tab, section === s.key && styles.tabActive]}
              onPress={() => setSection(s.key)}>
              <Text style={[styles.tabText, section === s.key && styles.tabTextActive]}>{s.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

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
    </View>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  switcherWrap: { borderBottomWidth: 1, borderBottomColor: Brand.border, backgroundColor: Brand.surface },
  switcher: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  tabActive: { backgroundColor: Brand.maroon },
  tabText: { fontSize: 13, fontWeight: '600', color: Brand.text2 },
  tabTextActive: { color: '#fff' },
  body: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  msg: { color: Brand.text3, fontSize: 14, textAlign: 'center' },
});
