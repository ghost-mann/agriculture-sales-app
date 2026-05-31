import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { CustomerPickerSheet } from '@/components/customer-picker-sheet';
import { Brand } from '@/constants/theme';
import { Detail } from '@/features/portal/components/Detail';
import { Home } from '@/features/portal/components/Home';
import { SectionList } from '@/features/portal/components/SectionList';
import type { Kind } from '@/features/portal/store';
import { usePortal } from '@/features/portal/store';

type Nav =
  | { view: 'home' }
  | { view: 'account' }
  | { view: 'list'; kind: Kind }
  | { view: 'detail'; kind: Kind; name: string };

const KIND_LABEL: Record<Kind, string> = {
  orders: 'Orders',
  shipments: 'Shipments',
  claims: 'Claims',
  invoices: 'Invoices',
  messages: 'Messages',
};

export default function PortalTab() {
  const { ctx, loading, loadError, impersonate, bootstrap, setImpersonate, hasCustomer } = usePortal();
  const [nav, setNav] = useState<Nav>({ view: 'home' });
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const isStaff = !!ctx?.is_staff;
  const title =
    nav.view === 'home'
      ? 'Portal'
      : nav.view === 'account'
        ? 'Account'
        : nav.view === 'list'
          ? KIND_LABEL[nav.kind]
          : nav.name;

  function back() {
    setNav((n) =>
      n.view === 'detail' ? { view: 'list', kind: n.kind } : { view: 'home' },
    );
  }

  function open(kind: Kind | 'account') {
    setNav(kind === 'account' ? { view: 'account' } : { view: 'list', kind });
  }

  return (
    <View style={styles.root}>
      <AppHeader title={title} subtitle={nav.view === 'home' ? 'Your account' : undefined} />

      {/* Back bar for nested views */}
      {nav.view !== 'home' ? (
        <Pressable style={styles.backBar} onPress={back}>
          <Ionicons name="chevron-back" size={18} color={Brand.green} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      {/* Staff impersonation bar */}
      {isStaff ? (
        <Pressable style={styles.impBar} onPress={() => setPickerOpen(true)}>
          <Ionicons name="eye-outline" size={16} color={Brand.maroon} />
          <Text style={styles.impText} numberOfLines={1}>
            {hasCustomer()
              ? `Viewing: ${ctx?.customer_name || impersonate || ctx?.customer}`
              : 'Pick a customer to view their account'}
          </Text>
          <Ionicons name="chevron-down" size={15} color={Brand.maroon} />
        </Pressable>
      ) : null}

      {loading ? (
        <Center>
          <ActivityIndicator color={Brand.green} size="large" />
        </Center>
      ) : loadError ? (
        <Center>
          <Ionicons name="alert-circle-outline" size={36} color={Brand.text3} />
          <Text style={styles.msg}>{loadError}</Text>
        </Center>
      ) : isStaff && !hasCustomer() ? (
        <Center>
          <Ionicons name="people-outline" size={36} color={Brand.text3} />
          <Text style={styles.msg}>Pick a customer above to view their orders, claims and invoices.</Text>
        </Center>
      ) : (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {nav.view === 'home' ? <Home onOpen={open} /> : null}
          {nav.view === 'account' ? <AccountView /> : null}
          {nav.view === 'list' ? (
            <SectionList kind={nav.kind} onOpen={(name) => setNav({ view: 'detail', kind: nav.kind, name })} />
          ) : null}
          {nav.view === 'detail' ? <Detail kind={nav.kind} name={nav.name} /> : null}
        </ScrollView>
      )}

      <CustomerPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={impersonate}
        onPick={(name) => {
          setNav({ view: 'home' });
          setImpersonate(name);
        }}
        title="View customer account"
      />
    </View>
  );
}

function AccountView() {
  const { ctx } = usePortal();
  const rows: { label: string; value: any }[] = [
    { label: 'Company', value: ctx?.customer_name },
    { label: 'Customer ID', value: ctx?.customer },
    { label: 'Group', value: ctx?.customer_group },
    { label: 'Territory', value: ctx?.territory },
    { label: 'Currency', value: ctx?.currency },
    { label: 'Payment terms', value: ctx?.payment_terms },
  ];
  return (
    <View style={{ gap: 16 }}>
      <View style={styles.card}>
        {rows.map((r) =>
          r.value ? (
            <View key={r.label} style={styles.accRow}>
              <Text style={styles.accLabel}>{r.label}</Text>
              <Text style={styles.accValue}>{String(r.value)}</Text>
            </View>
          ) : null,
        )}
      </View>

      {ctx?.manager ? (
        <View style={styles.card}>
          <Text style={styles.accSection}>Account manager</Text>
          <Text style={styles.mgrName}>{ctx.manager.name}</Text>
          <Text style={styles.mgrEmail}>{ctx.manager.email}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  backBar: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 14, paddingVertical: 8 },
  backText: { color: Brand.green, fontSize: 14, fontWeight: '600' },
  impBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.maroonSoft,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  impText: { flex: 1, color: Brand.maroon, fontSize: 12.5, fontWeight: '600' },
  body: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  msg: { color: Brand.text3, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 16,
    gap: 12,
  },
  accRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  accLabel: { fontSize: 12.5, color: Brand.text3 },
  accValue: { fontSize: 13.5, color: Brand.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  accSection: {
    fontSize: 11,
    fontWeight: '700',
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  mgrName: { fontSize: 15, fontWeight: '600', color: Brand.text },
  mgrEmail: { fontSize: 13, color: Brand.text2 },
});
