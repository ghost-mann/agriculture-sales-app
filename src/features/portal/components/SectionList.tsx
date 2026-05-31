import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { Brand } from '@/constants/theme';
import { fmtDate, fmtMoney } from '@/lib/format';
import type { Kind } from '../store';
import { usePortal } from '../store';

// Per-kind row presentation. Each returns the primary line, a meta line, an
// optional status, and an optional right-aligned amount.
function rowOf(kind: Kind, r: any) {
  switch (kind) {
    case 'orders':
      return {
        title: r.name,
        meta: `${fmtDate(r.transaction_date)}${r.po_no ? ` · PO ${r.po_no}` : ''}`,
        status: r.status,
        amount: fmtMoney(r.grand_total, r.currency),
      };
    case 'shipments':
      return {
        title: r.name,
        meta: `${fmtDate(r.posting_date)}${r.vehicle_no ? ` · ${r.vehicle_no}` : ''}${r.lr_no ? ` · LR ${r.lr_no}` : ''}`,
        status: r.status,
        amount: r.grand_total != null ? fmtMoney(r.grand_total, r.currency) : '',
      };
    case 'invoices':
      return {
        title: r.name,
        meta: `${fmtDate(r.posting_date)} · due ${fmtDate(r.due_date)}`,
        status: r.status,
        amount:
          r.outstanding_amount > 0
            ? `${fmtMoney(r.outstanding_amount, r.currency)} due`
            : fmtMoney(r.grand_total, r.currency),
      };
    case 'claims':
      return {
        title: r.name,
        meta: `${fmtDate(r.feedback_date)}${r.claim_type || r.feedback_type ? ` · ${r.claim_type || r.feedback_type}` : ''}`,
        status: r.status,
        amount: r.total_claim_cost ? fmtMoney(r.total_claim_cost) : '',
      };
    case 'messages':
      return {
        title: r.subject || '(no subject)',
        meta: `${fmtDate(r.communication_date)} · ${r.sent_or_received === 'Sent' ? 'You' : r.sender}`,
        status: r.sent_or_received,
        amount: '',
      };
  }
}

export function SectionList({ kind, onOpen }: { kind: Kind; onOpen: (name: string) => void }) {
  const { lists, loadList } = usePortal();
  const state = lists[kind];

  useEffect(() => {
    loadList(kind);
  }, [kind, loadList]);

  if (state.rows == null) {
    return <ActivityIndicator color={Brand.green} style={{ marginTop: 40 }} />;
  }
  if (state.err) {
    return <Text style={styles.msg}>{state.err}</Text>;
  }

  return (
    <FlatList
      data={state.rows}
      keyExtractor={(r) => r.name}
      contentContainerStyle={{ gap: 8, padding: 16, paddingBottom: 32 }}
      ListEmptyComponent={<Text style={styles.msg}>Nothing here yet.</Text>}
      renderItem={({ item: r }) => {
        const v = rowOf(kind, r);
        return (
          <Pressable style={styles.row} onPress={() => onOpen(r.name)}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.title} numberOfLines={1}>
                {v.title}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {v.meta}
              </Text>
              <StatusBadge status={v.status} />
            </View>
            {v.amount ? <Text style={styles.amount}>{v.amount}</Text> : null}
            <Ionicons name="chevron-forward" size={16} color={Brand.text3} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
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
  title: { fontSize: 14, fontWeight: '600', color: Brand.text },
  meta: { fontSize: 11.5, color: Brand.text3 },
  amount: { fontSize: 13, fontWeight: '700', color: Brand.text },
  msg: { textAlign: 'center', color: Brand.text3, marginTop: 40 },
});
