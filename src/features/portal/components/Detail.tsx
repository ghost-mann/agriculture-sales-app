import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { Brand } from '@/constants/theme';
import { fmtDate, fmtMoney } from '@/lib/format';
import type { Kind } from '../store';
import { usePortal } from '../store';
import { Thread } from './Thread';

function Field({ label, value }: { label: string; value: any }) {
  if (value == null || value === '') return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{String(value)}</Text>
    </View>
  );
}

function summaryFields(kind: Kind, d: any): { label: string; value: any }[] {
  switch (kind) {
    case 'orders':
      return [
        { label: 'Order date', value: fmtDate(d.transaction_date) },
        { label: 'Delivery', value: fmtDate(d.delivery_date) },
        { label: 'PO No', value: d.po_no },
        { label: 'Total', value: fmtMoney(d.grand_total, d.currency) },
      ];
    case 'shipments':
      return [
        { label: 'Shipped', value: fmtDate(d.posting_date) },
        { label: 'Vehicle', value: d.vehicle_no },
        { label: 'LR No', value: d.lr_no },
        { label: 'Transporter', value: d.transporter_name },
      ];
    case 'invoices':
      return [
        { label: 'Invoice date', value: fmtDate(d.posting_date) },
        { label: 'Due', value: fmtDate(d.due_date) },
        { label: 'Total', value: fmtMoney(d.grand_total, d.currency) },
        { label: 'Outstanding', value: fmtMoney(d.outstanding_amount, d.currency) },
      ];
    case 'claims':
      return [
        { label: 'Date', value: fmtDate(d.feedback_date) },
        { label: 'Type', value: d.claim_type || d.feedback_type },
        { label: 'Invoice', value: d.invoice_number },
        { label: 'Consignment', value: d.consignment_number },
        { label: 'Stems claimed', value: d.total_stems_claimed },
        { label: 'Claim cost', value: d.total_claim_cost ? fmtMoney(d.total_claim_cost) : null },
      ];
    default:
      return [];
  }
}

export function Detail({ kind, name }: { kind: Kind; name: string }) {
  const { getDoc, loadClaimMessages, replyToClaim, replyToMessage } = usePortal();
  const [doc, setDoc] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setDoc(null);
    setErr(null);
    // Messages render their content through the Thread directly, so only fetch
    // the document here for the non-message kinds.
    if (kind === 'messages') return;
    getDoc(kind, name)
      .then((d) => alive && setDoc(d))
      .catch((e) => alive && setErr(e?.message || 'Could not load.'));
    return () => {
      alive = false;
    };
  }, [kind, name, getDoc]);

  // ── Messages: show the email as a bubble + reply composer ──
  if (kind === 'messages') {
    return (
      <View style={{ gap: 16 }}>
        <Thread
          emptyHint="No message content."
          load={async () => {
            const d = await getDoc('messages', name);
            return [
              {
                name: d.name,
                sender: d.sender,
                sender_full_name: d.sender_full_name,
                content: d.content,
                communication_date: d.communication_date,
                sent_or_received: d.sent_or_received,
              },
            ];
          }}
          send={(c) => replyToMessage(name, c)}
        />
      </View>
    );
  }

  if (err) return <Text style={styles.msg}>{err}</Text>;
  if (!doc) return <ActivityIndicator color={Brand.green} style={{ marginTop: 40 }} />;

  const items: any[] = Array.isArray(doc.items) ? doc.items : [];
  const showItems = kind === 'orders' || kind === 'shipments' || kind === 'invoices';

  return (
    <View style={{ gap: 18 }}>
      <View style={styles.head}>
        <Text style={styles.docName}>{doc.name}</Text>
        <StatusBadge status={doc.status} />
      </View>

      <View style={styles.fieldGrid}>
        {summaryFields(kind, doc).map((f) => (
          <Field key={f.label} label={f.label} value={f.value} />
        ))}
      </View>

      {showItems && items.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Items</Text>
          {items.map((it, i) => (
            <View key={it.name || i} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {it.item_name || it.item_code}
                </Text>
                <Text style={styles.itemMeta}>
                  {it.qty} {it.uom} × {fmtMoney(it.rate, doc.currency)}
                </Text>
              </View>
              <Text style={styles.itemAmt}>{fmtMoney(it.amount, doc.currency)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {kind === 'claims' ? (
        <Thread
          emptyHint="No replies yet. Start the conversation with the team below."
          load={() => loadClaimMessages(name)}
          send={(c) => replyToClaim(name, c)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  docName: { fontSize: 18, fontWeight: '700', color: Brand.text },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: Brand.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
  },
  field: { width: '45%', flexGrow: 1 },
  fieldLabel: {
    fontSize: 10,
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  fieldValue: { fontSize: 14, color: Brand.text, fontWeight: '500' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 12,
  },
  itemName: { fontSize: 13.5, fontWeight: '600', color: Brand.text },
  itemMeta: { fontSize: 11.5, color: Brand.text3, marginTop: 2 },
  itemAmt: { fontSize: 13, fontWeight: '700', color: Brand.text },
  msg: { textAlign: 'center', color: Brand.text3, marginTop: 40 },
});
