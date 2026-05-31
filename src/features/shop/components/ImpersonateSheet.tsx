import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { useShop } from '../store';

// Staff-only "shop on behalf of a customer" picker (mirrors the web
// ImpersonatePicker). Threads the chosen customer through every backend call.
export function ImpersonateSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { customers, loadingCustomers, searchCustomers, setImpersonate, impersonate } = useShop();
  const [q, setQ] = useState('');
  const deb = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) searchCustomers('');
  }, [visible, searchCustomers]);

  function onChange(v: string) {
    setQ(v);
    if (deb.current) clearTimeout(deb.current);
    deb.current = setTimeout(() => searchCustomers(v.trim()), 250);
  }

  function pick(name: string | null) {
    setImpersonate(name);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Shop as customer</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={Brand.text2} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Brand.text3} />
          <TextInput
            style={styles.search}
            placeholder="Search customer…"
            placeholderTextColor={Brand.text3}
            value={q}
            onChangeText={onChange}
            autoCapitalize="none"
            autoFocus
          />
        </View>

        {impersonate ? (
          <Pressable style={styles.clearRow} onPress={() => pick(null)}>
            <Ionicons name="close-circle-outline" size={18} color={Brand.bad} />
            <Text style={styles.clearText}>Stop impersonating ({impersonate})</Text>
          </Pressable>
        ) : null}

        {loadingCustomers ? (
          <ActivityIndicator color={Brand.green} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(c) => c.name}
            contentContainerStyle={{ padding: 12, gap: 8 }}
            ListEmptyComponent={<Text style={styles.empty}>No customers match.</Text>}
            renderItem={({ item: c }) => (
              <Pressable
                style={[styles.row, impersonate === c.name && styles.rowActive]}
                onPress={() => pick(c.name)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{c.customer_name || c.name}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {[c.name, c.customer_group, c.territory].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {impersonate === c.name ? (
                  <Ionicons name="checkmark-circle" size={20} color={Brand.green} />
                ) : null}
              </Pressable>
            )}
          />
        )}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 14,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: Brand.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  search: { flex: 1, fontSize: 15, color: Brand.text },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  clearText: { color: Brand.bad, fontSize: 13, fontWeight: '500' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
  },
  rowActive: { borderColor: Brand.green, backgroundColor: Brand.greenSoft },
  rowName: { fontSize: 14, fontWeight: '600', color: Brand.text },
  rowMeta: { fontSize: 11.5, color: Brand.text3, marginTop: 2 },
  empty: { textAlign: 'center', color: Brand.text3, marginTop: 24 },
});
