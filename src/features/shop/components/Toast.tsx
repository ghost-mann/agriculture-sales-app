import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useShop } from '../store';

const BG = { ok: Brand.good, err: Brand.bad, info: Brand.text };

export function Toast() {
  const toast = useShop((s) => s.toast);
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.toast, { backgroundColor: BG[toast.kind] }]}>
        <Text style={styles.text}>{toast.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    zIndex: 50,
  },
  toast: {
    maxWidth: '90%',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: { color: '#fff', fontSize: 13.5, fontWeight: '500' },
});
