import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PublicHeader } from '@/components/public-header';
import { Brand, Fonts } from '@/constants/theme';

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'leaf-outline', title: 'Farm-fresh', body: 'Cut, graded and cooled within hours on our Kenyan farms.' },
  { icon: 'airplane-outline', title: 'Global delivery', body: 'Cold-chain logistics to florists and wholesalers worldwide.' },
  { icon: 'ribbon-outline', title: 'Trusted partner', body: 'Decades of consistent quality, fair pricing and service.' },
];

export default function PublicHome() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <PublicHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>KAREN ROSES · KENYA</Text>
          <Text style={styles.heroTitle}>Premium roses, grown with care.</Text>
          <View style={styles.rule} />
          <Text style={styles.heroSub}>
            Fresh-cut stems from our Kenyan farms to florists and wholesalers around the world.
          </Text>
          <View style={styles.heroCtas}>
            <Pressable style={styles.ctaPrimary} onPress={() => router.push('/login')}>
              <Text style={styles.ctaPrimaryText}>Member Login</Text>
            </Pressable>
            <Pressable style={styles.ctaGhost} onPress={() => router.push('/about')}>
              <Text style={styles.ctaGhostText}>About us</Text>
            </Pressable>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={22} color={Brand.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureBody}>{f.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Partner / portal card */}
        <View style={styles.partnerCard}>
          <Text style={styles.partnerEyebrow}>FOR OUR PARTNERS</Text>
          <Text style={styles.partnerTitle}>Your account, in your pocket</Text>
          <Text style={styles.partnerBody}>
            Browse the catalogue, place orders, track shipments, raise claims and message your
            account manager — all in one place. Sales reps can manage their accounts and pipeline too.
          </Text>
          <Pressable style={styles.partnerCta} onPress={() => router.push('/login')}>
            <Ionicons name="lock-closed-outline" size={16} color="#fff" />
            <Text style={styles.partnerCtaText}>Member Login</Text>
          </Pressable>
        </View>

        {/* Contact teaser */}
        <Pressable style={styles.contactRow} onPress={() => router.push('/contact')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Become a partner</Text>
            <Text style={styles.contactBody}>Not a member yet? Get in touch with our team.</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={Brand.green} />
        </Pressable>

        <Text style={styles.footer}>© Karen Roses · Nairobi, Kenya</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  scroll: { paddingBottom: 36 },
  hero: {
    backgroundColor: Brand.greenDark,
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 48,
  },
  eyebrow: {
    color: Brand.gold,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 16,
  },
  heroTitle: {
    color: '#fff',
    fontFamily: Fonts?.serif,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '600',
  },
  rule: { width: 48, height: 3, backgroundColor: Brand.gold, marginVertical: 18, borderRadius: 2 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 23 },
  heroCtas: { flexDirection: 'row', gap: 12, marginTop: 26 },
  ctaPrimary: { backgroundColor: '#fff', paddingHorizontal: 22, paddingVertical: 13, borderRadius: 999 },
  ctaPrimaryText: { color: Brand.greenDark, fontWeight: '700', fontSize: 14.5 },
  ctaGhost: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  ctaGhostText: { color: '#fff', fontWeight: '600', fontSize: 14.5 },
  section: { paddingHorizontal: 24, paddingTop: 30, gap: 20 },
  feature: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Brand.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { fontSize: 16, fontWeight: '700', color: Brand.text, marginBottom: 3 },
  featureBody: { fontSize: 13.5, color: Brand.text2, lineHeight: 20 },
  partnerCard: {
    margin: 24,
    marginTop: 32,
    backgroundColor: Brand.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 24,
  },
  partnerEyebrow: { color: Brand.gold, fontSize: 10.5, letterSpacing: 1.6, fontWeight: '700' },
  partnerTitle: {
    fontFamily: Fonts?.serif,
    fontSize: 24,
    color: Brand.text,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  partnerBody: { fontSize: 14, color: Brand.text2, lineHeight: 21, marginBottom: 18 },
  partnerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Brand.green,
    paddingVertical: 14,
    borderRadius: 12,
  },
  partnerCtaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: Brand.greenSoft,
  },
  contactTitle: { fontSize: 15.5, fontWeight: '700', color: Brand.greenDark },
  contactBody: { fontSize: 13, color: Brand.text2, marginTop: 2 },
  footer: { textAlign: 'center', color: Brand.text3, fontSize: 12, marginTop: 30 },
});
