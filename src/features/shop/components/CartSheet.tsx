import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { fmtMoney } from '@/lib/format';
import { useShop } from '../store';

export function CartSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { cart, updateQty, clearCart, submitQuotation } = useShop();
  const [submitting, setSubmitting] = useState(false);
  const lines = cart?.items ?? [];

  async function onSubmit() {
    setSubmitting(true);
    try {
      const r = await submitQuotation();
      onClose();
      if (r?.name) {
        Alert.alert('Request sent', `Your quotation ${r.name} has been submitted to the team.`);
      }
    } catch {
      /* toast already shown by store */
    } finally {
      setSubmitting(false);
    }
  }

  function confirmClear() {
    Alert.alert('Empty cart?', 'Remove all items from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Empty', style: 'destructive', onPress: () => clearCart() },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Your cart</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={Brand.text2} />
          </Pressable>
        </View>

        {lines.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cart-outline" size={40} color={Brand.text3} />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          <FlatList
            data={lines}
            keyExtractor={(l) => l.item_code}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item: l }) => (
              <View style={styles.line}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineName} numberOfLines={2}>
                    {l.item_name}
                  </Text>
                  <Text style={styles.lineRate}>
                    {fmtMoney(l.rate, cart?.currency)} · {l.uom}
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    style={styles.stepBtn}
                    hitSlop={6}
                    onPress={() => updateQty(l.item_code, l.qty - 1)}>
                    <Ionicons name="remove" size={16} color={Brand.green} />
                  </Pressable>
                  <Text style={styles.qty}>{l.qty}</Text>
                  <Pressable
                    style={styles.stepBtn}
                    hitSlop={6}
                    onPress={() => updateQty(l.item_code, l.qty + 1)}>
                    <Ionicons name="add" size={16} color={Brand.green} />
                  </Pressable>
                </View>
                <Text style={styles.lineAmt}>{fmtMoney(l.amount, cart?.currency)}</Text>
              </View>
            )}
          />
        )}

        {lines.length > 0 ? (
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Pressable onPress={confirmClear} hitSlop={8}>
                <Text style={styles.clear}>Empty cart</Text>
              </Pressable>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.total}>{fmtMoney(cart?.total, cart?.currency)}</Text>
              </View>
            </View>
            <Pressable
              style={[styles.submit, submitting && { opacity: 0.6 }]}
              onPress={onSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Request quotation</Text>
              )}
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Brand.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { color: Brand.text3, fontSize: 14 },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 12,
  },
  lineName: { fontSize: 13.5, fontWeight: '600', color: Brand.text },
  lineRate: { fontSize: 11.5, color: Brand.text3, marginTop: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.green,
    borderRadius: 8,
    paddingHorizontal: 2,
  },
  stepBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 24, textAlign: 'center', fontSize: 13.5, fontWeight: '700', color: Brand.text },
  lineAmt: { minWidth: 64, textAlign: 'right', fontSize: 13, fontWeight: '700', color: Brand.text },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    padding: 16,
    gap: 14,
    backgroundColor: Brand.surface,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clear: { color: Brand.bad, fontSize: 13, fontWeight: '500' },
  totalLabel: {
    fontSize: 10,
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  total: { fontSize: 22, fontWeight: '700', color: Brand.text },
  submit: {
    height: 52,
    borderRadius: 12,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
