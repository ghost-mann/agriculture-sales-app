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
import { apiGet } from '@/lib/api';

type Customer = {
  name: string;
  customer_name?: string;
  customer_group?: string;
  territory?: string;
};

/**
 * Staff-only "act on behalf of a customer" picker, shared by the Shop and
 * Portal tabs. Self-contained: it searches customers itself and reports the
 * chosen account (or null to stop) via onPick; the host decides what that means.
 */
export function CustomerPickerSheet({
  visible,
  onClose,
  value,
  onPick,
  title = 'Choose a customer',
}: {
  visible: boolean;
  onClose: () => void;
  value: string | null;
  onPick: (name: string | null) => void;
  title?: string;
}) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const deb = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function search(query: string) {
    setLoading(true);
    try {
      const r = await apiGet('customer_portal.api.customer.list_customers', { search: query, limit: 30 });
      setRows(r || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (visible) search('');
  }, [visible]);

  function onChange(v: string) {
    setQ(v);
    if (deb.current) clearTimeout(deb.current);
    deb.current = setTimeout(() => search(v.trim()), 250);
  }

  function pick(name: string | null) {
    onPick(name);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
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

        {value ? (
          <Pressable style={styles.clearRow} onPress={() => pick(null)}>
            <Ionicons name="close-circle-outline" size={18} color={Brand.bad} />
            <Text style={styles.clearText}>Clear ({value})</Text>
          </Pressable>
        ) : null}

        {loading ? (
          <ActivityIndicator color={Brand.green} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(c) => c.name}
            contentContainerStyle={{ padding: 12, gap: 8 }}
            ListEmptyComponent={<Text style={styles.empty}>No customers match.</Text>}
            renderItem={({ item: c }) => (
              <Pressable
                style={[styles.row, value === c.name && styles.rowActive]}
                onPress={() => pick(c.name)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{c.customer_name || c.name}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {[c.name, c.customer_group, c.territory].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {value === c.name ? (
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
