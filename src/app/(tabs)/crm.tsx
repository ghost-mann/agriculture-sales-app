import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Brand } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

const PIPELINE: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'person-add-outline', label: 'Leads' },
  { icon: 'trending-up-outline', label: 'Opportunities' },
  { icon: 'business-outline', label: 'Customers' },
  { icon: 'mail-outline', label: 'Mail' },
];

export default function CrmScreen() {
  const { identity } = useAuth();

  // Defense in depth: even if the tab were somehow reached, a non-CRM user is
  // bounced back to Shop. The backend route is role-guarded too.
  if (!identity?.isCrm) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.root}>
      <AppHeader title="CRM" subtitle="Sales pipeline" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Ionicons name="pulse-outline" size={40} color={Brand.maroon} />
          <Text style={styles.heroTitle}>Sales CRM</Text>
          <Text style={styles.heroSub}>Visible to sales staff only.</Text>
        </View>

        <View style={styles.grid}>
          {PIPELINE.map((p) => (
            <View key={p.label} style={styles.tile}>
              <Ionicons name={p.icon} size={22} color={Brand.maroon} />
              <Text style={styles.tileLabel}>{p.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  body: { padding: 20, gap: 18 },
  hero: {
    backgroundColor: Brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: { fontSize: 18, fontWeight: '600', color: Brand.text },
  heroSub: { fontSize: 13, color: Brand.text2 },
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
});
