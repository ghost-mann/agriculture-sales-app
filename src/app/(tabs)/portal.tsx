import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Brand } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

const SECTIONS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'receipt-outline', label: 'Orders' },
  { icon: 'cube-outline', label: 'Shipments' },
  { icon: 'alert-circle-outline', label: 'Claims' },
  { icon: 'document-text-outline', label: 'Invoices' },
  { icon: 'chatbubbles-outline', label: 'Messages' },
];

export default function PortalScreen() {
  const { identity } = useAuth();
  return (
    <View style={styles.root}>
      <AppHeader title="Portal" subtitle="Your account" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <Text style={styles.greeting}>
            Signed in as {identity?.fullName || identity?.user}
          </Text>
          <Text style={styles.sub}>
            {identity?.isStaff ? 'Sales / staff session' : 'Customer session'}
          </Text>
        </View>

        <View style={styles.grid}>
          {SECTIONS.map((s) => (
            <View key={s.label} style={styles.tile}>
              <Ionicons name={s.icon} size={22} color={Brand.green} />
              <Text style={styles.tileLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footnote}>
          These sections will be wired to the live customer-portal API — orders, claim
          replies, invoices and account-manager messages.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  body: { padding: 20, gap: 18 },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 18,
  },
  greeting: { fontSize: 16, fontWeight: '600', color: Brand.text },
  sub: {
    fontSize: 11,
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 18,
    gap: 10,
  },
  tileLabel: { fontSize: 14, fontWeight: '600', color: Brand.text },
  footnote: { fontSize: 12, color: Brand.text3, lineHeight: 18 },
});
