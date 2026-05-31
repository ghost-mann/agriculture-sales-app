import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { fmtMoney } from '@/lib/format';
import { useShop } from '../store';

// Floating "view cart" bar — the standard ecom pattern. Appears only when the
// cart has items; shows count + running total and opens the cart.
export function CartBar({ onOpen }: { onOpen: () => void }) {
  const cart = useShop((s) => s.cart);
  const count = cart?.item_count ?? 0;
  if (count < 1) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable style={styles.bar} onPress={onOpen}>
        <View style={styles.left}>
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.count}>{count}</Text>
        </View>
        <Text style={styles.label}>View cart</Text>
        <Text style={styles.total}>{fmtMoney(cart?.total, cart?.currency)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '90%',
    backgroundColor: Brand.green,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  count: {
    color: Brand.green,
    backgroundColor: '#fff',
    fontWeight: '800',
    fontSize: 12,
    minWidth: 20,
    textAlign: 'center',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  label: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700' },
  total: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
