import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PublicHeader } from '@/components/public-header';
import { Brand, Fonts } from '@/constants/theme';

const STATS = [
  { value: '25+', label: 'Years growing' },
  { value: '40+', label: 'Rose varieties' },
  { value: '30+', label: 'Export markets' },
];

const VALUES: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'leaf-outline', title: 'Quality first', body: 'Every stem is graded by hand and cold-stored within hours of cutting.' },
  { icon: 'people-outline', title: 'Our people', body: 'We invest in the farming communities who make our roses possible.' },
  { icon: 'earth-outline', title: 'Sustainably grown', body: 'Responsible water, soil and energy practices across our farms.' },
];

export default function About() {
  return (
    <View style={styles.root}>
      <PublicHeader />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>ABOUT US</Text>
        <Text style={styles.title}>Growing Kenya's finest roses</Text>
        <Text style={styles.lead}>
          Karen Roses has cultivated premium roses in the Kenyan highlands for over two decades.
          From farm to florist, we pair ideal growing conditions with careful handling and a
          reliable cold chain — so every bloom arrives fresh and full.
        </Text>

        <View style={styles.stats}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>What we stand for</Text>
        <View style={{ gap: 18 }}>
          {VALUES.map((v) => (
            <View key={v.title} style={styles.value}>
              <View style={styles.valueIcon}>
                <Ionicons name={v.icon} size={20} color={Brand.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.valueTitle}>{v.title}</Text>
                <Text style={styles.valueBody}>{v.body}</Text>
              </View>
            </View>
          ))}
        </View>

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
    lineHeight: 36,
    fontWeight: '600',
    color: Brand.text,
    marginTop: 12,
    marginBottom: 14,
  },
  lead: { fontSize: 15, lineHeight: 24, color: Brand.text2 },
  stats: {
    flexDirection: 'row',
    backgroundColor: Brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 18,
    marginVertical: 28,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: Fonts?.serif, fontSize: 26, fontWeight: '700', color: Brand.green },
  statLabel: { fontSize: 11.5, color: Brand.text3, marginTop: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Brand.text, marginBottom: 16 },
  value: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  valueIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Brand.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTitle: { fontSize: 15.5, fontWeight: '700', color: Brand.text, marginBottom: 3 },
  valueBody: { fontSize: 13.5, color: Brand.text2, lineHeight: 20 },
  footer: { textAlign: 'center', color: Brand.text3, fontSize: 12, marginTop: 36 },
});
