import { StyleSheet, Text, View } from 'react-native';

import { statusTone } from '@/lib/format';

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const tone = statusTone(status);
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.fg }]} numberOfLines={1}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.2 },
});
