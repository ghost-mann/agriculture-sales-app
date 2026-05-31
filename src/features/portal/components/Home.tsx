import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { Brand } from '@/constants/theme';
import { fmtDate, fmtMoney } from '@/lib/format';
import type { Kind } from '../store';
import { usePortal } from '../store';

const TILES: { kind: Kind | 'account'; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { kind: 'orders', icon: 'receipt-outline', label: 'Orders' },
  { kind: 'shipments', icon: 'cube-outline', label: 'Shipments' },
  { kind: 'claims', icon: 'alert-circle-outline', label: 'Claims' },
  { kind: 'invoices', icon: 'document-text-outline', label: 'Invoices' },
  { kind: 'messages', icon: 'chatbubbles-outline', label: 'Messages' },
  { kind: 'account', icon: 'business-outline', label: 'Company' },
];

export function Home({ onOpen }: { onOpen: (kind: Kind | 'account') => void }) {
  const { ctx, overview } = usePortal();
  const k = overview?.kpis;

  const kpis = [
    { label: 'Open orders', value: k?.open_orders, tone: Brand.green },
    { label: 'On the way', value: k?.in_flight, tone: Brand.info },
    { label: 'To pay', value: k?.overdue, tone: Brand.bad },
    { label: 'Open claims', value: k?.open_claims, tone: Brand.maroon },
  ];

  return (
    <View style={{ gap: 18 }}>
      <View style={styles.welcome}>
        <Text style={styles.company}>{ctx?.customer_name || ctx?.customer}</Text>
        {ctx?.territory ? <Text style={styles.terr}>{ctx.territory}</Text> : null}
      </View>

      <View style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <View key={kpi.label} style={styles.kpi}>
            <Text style={[styles.kpiValue, { color: kpi.tone }]}>{kpi.value ?? '—'}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tileGrid}>
        {TILES.map((t) => (
          <Pressable key={t.kind} style={styles.tile} onPress={() => onOpen(t.kind)}>
            <Ionicons name={t.icon} size={22} color={Brand.green} />
            <Text style={styles.tileLabel}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {overview?.recent_orders?.length ? (
        <View>
          <Text style={styles.sectionTitle}>Recent orders</Text>
          <View style={{ gap: 8 }}>
            {overview.recent_orders.slice(0, 5).map((o: any) => (
              <Pressable key={o.name} style={styles.recent} onPress={() => onOpen('orders')}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentName}>{o.name}</Text>
                  <Text style={styles.recentMeta}>{fmtDate(o.transaction_date)}</Text>
                </View>
                <StatusBadge status={o.status} />
                <Text style={styles.recentAmt}>{fmtMoney(o.grand_total, o.currency)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: { gap: 2 },
  company: { fontSize: 18, fontWeight: '700', color: Brand.text },
  terr: { fontSize: 12, color: Brand.text3 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
  },
  kpiValue: { fontSize: 26, fontWeight: '700' },
  kpiLabel: {
    fontSize: 10.5,
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  tileLabel: { fontSize: 12, fontWeight: '600', color: Brand.text },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  recent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 12,
  },
  recentName: { fontSize: 13.5, fontWeight: '600', color: Brand.text },
  recentMeta: { fontSize: 11, color: Brand.text3, marginTop: 2 },
  recentAmt: { fontSize: 12.5, fontWeight: '700', color: Brand.text },
});
