import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Brand } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function ShopScreen() {
  const { identity } = useAuth();
  return (
    <View style={styles.root}>
      <AppHeader title="Shop" subtitle="Karen Roses Webshop" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Ionicons name="storefront-outline" size={40} color={Brand.green} />
          <Text style={styles.heroTitle}>Browse & order varieties</Text>
          <Text style={styles.heroSub}>
            Catalog, cart, and quick re-order are being wired to the live webshop API.
          </Text>
        </View>

        {identity?.isStaff ? (
          <View style={styles.note}>
            <Ionicons name="eye-outline" size={16} color={Brand.maroon} />
            <Text style={styles.noteText}>
              Staff: you'll be able to shop on behalf of a customer (impersonation) here.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  body: { padding: 20, gap: 16 },
  hero: {
    backgroundColor: Brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  heroTitle: { fontSize: 18, fontWeight: '600', color: Brand.text },
  heroSub: { fontSize: 13, color: Brand.text2, textAlign: 'center', lineHeight: 19 },
  note: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Brand.maroonSoft,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  noteText: { flex: 1, fontSize: 12.5, color: Brand.maroon, lineHeight: 18 },
});
