import { Link, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

// Top navigation for the public marketing pages — gives the app a "real
// website" feel: brand on the left, page links, and a Member Login button.
export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.bar}>
        <Link href="/" asChild>
          <Pressable style={styles.brand} hitSlop={6}>
            <View style={styles.mark}>
              <Text style={styles.markText}>KR</Text>
            </View>
            <Text style={styles.brandName}>Karen Roses</Text>
          </Pressable>
        </Link>

        <Pressable style={styles.signIn} onPress={() => router.push('/login')}>
          <Text style={styles.signInText}>Member Login</Text>
        </Pressable>
      </View>

      <View style={styles.nav}>
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href} asChild>
              <Pressable hitSlop={8}>
                <Text style={[styles.link, active && styles.linkActive]}>{l.label}</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Brand.surface },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  brandName: { fontSize: 17, fontWeight: '600', color: Brand.text },
  signIn: {
    backgroundColor: Brand.green,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  signInText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  nav: {
    flexDirection: 'row',
    gap: 22,
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  link: { fontSize: 14, color: Brand.text3, paddingVertical: 4 },
  linkActive: { color: Brand.green, fontWeight: '700' },
});
