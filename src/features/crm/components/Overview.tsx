import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { fmtMoney } from '@/lib/format';

export function Overview({ data }: { data: any }) {
  const k = data?.kpis ?? {};
  const cards = [
    { label: 'Leads', value: k.leads?.total ?? 0, sub: `${k.leads?.open ?? 0} open · ${k.leads?.conv_rate ?? 0}% conv`, tone: Brand.green },
    { label: 'Opportunities', value: k.opps?.total ?? 0, sub: `${k.opps?.open ?? 0} open · ${k.opps?.won ?? 0} won`, tone: Brand.info },
    { label: 'Prospects', value: k.prosp?.total ?? 0, sub: `${k.prosp?.territories ?? 0} territories`, tone: Brand.gold },
    { label: 'Customers', value: k.cust?.active ?? 0, sub: `${k.cust?.companies ?? 0} companies`, tone: Brand.maroon },
    { label: 'Revenue 30d', value: fmtMoney(k.revenue_30d?.usd ?? 0, 'USD'), sub: `${k.revenue_30d?.orders ?? 0} orders`, tone: Brand.green, wide: true },
    { label: 'Open tasks', value: k.tasks?.open ?? 0, sub: `${k.tasks?.high ?? 0} high priority`, tone: Brand.bad },
  ];

  const funnel: { label: string; count: number }[] = data?.funnel ?? [];
  const max = Math.max(1, ...funnel.map((f) => f.count));

  return (
    <View style={{ gap: 18 }}>
      <View style={styles.grid}>
        {cards.map((c) => (
          <View key={c.label} style={[styles.card, c.wide && { width: '100%' }]}>
            <Text style={[styles.value, { color: c.tone }]}>{c.value}</Text>
            <Text style={styles.label}>{c.label}</Text>
            <Text style={styles.sub}>{c.sub}</Text>
          </View>
        ))}
      </View>

      {funnel.length ? (
        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Pipeline funnel</Text>
          {funnel.map((f) => (
            <View key={f.label} style={styles.funnelRow}>
              <Text style={styles.funnelLabel}>{f.label}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(f.count / max) * 100}%` }]} />
              </View>
              <Text style={styles.funnelCount}>{f.count}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
  },
  value: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: Brand.text, marginTop: 2 },
  sub: { fontSize: 11, color: Brand.text3, marginTop: 2 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  funnelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  funnelLabel: { width: 96, fontSize: 12, color: Brand.text2 },
  barTrack: { flex: 1, height: 14, backgroundColor: Brand.surface2, borderRadius: 7, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Brand.green, borderRadius: 7 },
  funnelCount: { width: 44, textAlign: 'right', fontSize: 12.5, fontWeight: '700', color: Brand.text },
});
