import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PublicHeader } from '@/components/public-header';
import { Brand, Fonts } from '@/constants/theme';

const EMAIL = 'sales@karenroses.com';
const PHONE = '+254700000000';

const ROWS: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  action?: () => void;
}[] = [
  { icon: 'mail-outline', title: 'Email', value: EMAIL, action: () => Linking.openURL(`mailto:${EMAIL}`) },
  { icon: 'call-outline', title: 'Phone', value: PHONE, action: () => Linking.openURL(`tel:${PHONE}`) },
  { icon: 'location-outline', title: 'Farm & office', value: 'Karen, Nairobi, Kenya' },
  { icon: 'time-outline', title: 'Hours', value: 'Mon–Sat · 7:00–18:00 EAT' },
];

export default function Contact() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <PublicHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>CONTACT</Text>
        <Text style={styles.title}>Get in touch</Text>
        <Text style={styles.lead}>
          Questions, orders or partnership enquiries — our team is happy to help.
        </Text>

        <View style={styles.card}>
          {ROWS.map((r, i) => (
            <Pressable
              key={r.title}
              style={[styles.row, i < ROWS.length - 1 && styles.rowBorder]}
              onPress={r.action}
              disabled={!r.action}>
              <View style={styles.rowIcon}>
                <Ionicons name={r.icon} size={19} color={Brand.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{r.title}</Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
              {r.action ? <Ionicons name="open-outline" size={17} color={Brand.text3} /> : null}
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.cta} onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>
          <Ionicons name="mail-outline" size={18} color="#fff" />
          <Text style={styles.ctaText}>Email our team</Text>
        </Pressable>

        <Pressable style={styles.memberRow} onPress={() => router.push('/login')}>
          <Text style={styles.memberText}>Already a partner? </Text>
          <Text style={styles.memberLink}>Member Login</Text>
        </Pressable>

        <Text style={styles.footer}>© Karen Roses · Nairobi, Kenya</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  scroll: { padding: 24, paddingBottom: 40 },
  eyebrow: { color: Brand.gold, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  title: {
    fontFamily: Fonts?.serif,
    fontSize: 30,
    fontWeight: '600',
    color: Brand.text,
    marginTop: 12,
    marginBottom: 10,
  },
  lead: { fontSize: 15, lineHeight: 23, color: Brand.text2, marginBottom: 24 },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Brand.border },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Brand.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 11, color: Brand.text3, textTransform: 'uppercase', letterSpacing: 0.6 },
  rowValue: { fontSize: 15, color: Brand.text, fontWeight: '600', marginTop: 2 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Brand.green,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 22,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  memberRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  memberText: { color: Brand.text2, fontSize: 14 },
  memberLink: { color: Brand.green, fontSize: 14, fontWeight: '700' },
  footer: { textAlign: 'center', color: Brand.text3, fontSize: 12, marginTop: 34 },
});
