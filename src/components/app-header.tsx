import { type ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

function initials(s?: string | null): string {
  if (!s) return '?';
  const parts = String(s)
    .replace(/<[^>]+>/g, '')
    .trim()
    .split(/[\s.@_-]+/)
    .filter((x) => x && !/^\d+$/.test(x));
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

/**
 * Consistent top bar for every signed-in screen: section title + an avatar
 * chip that opens a sign-out prompt. Staff get a small "STAFF" marker so it's
 * obvious which kind of session they're in.
 */
export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const { identity, signOut } = useAuth();
  const name = identity?.fullName || identity?.user || '';

  function onChip() {
    Alert.alert(name || 'Account', identity?.user || '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.bar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
        {right}
        <Pressable style={styles.chip} onPress={onChip} hitSlop={8}>
          {identity?.isStaff ? <Text style={styles.staff}>STAFF</Text> : null}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(name)}</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Brand.surface },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '600', color: Brand.text },
  sub: {
    fontSize: 10,
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  staff: {
    fontSize: 9,
    fontWeight: '700',
    color: Brand.maroon,
    backgroundColor: Brand.maroonSoft,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    letterSpacing: 0.6,
    overflow: 'hidden',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
