import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { apiGet, apiPost } from '@/lib/api';
import { fmtDate, fmtDateTime, stripHtml } from '@/lib/format';

const FOLDERS: { key: string; label: string; countKey?: string }[] = [
  { key: 'inbox', label: 'Inbox', countKey: 'inbox' },
  { key: 'sent', label: 'Sent', countKey: 'sent_ok' },
  { key: 'crm_customers', label: 'Customers', countKey: 'crm_customers' },
  { key: 'crm_leads', label: 'Leads', countKey: 'crm_leads' },
  { key: 'crm_opps', label: 'Opps', countKey: 'crm_opps' },
  { key: 'crm_quotations', label: 'Quotations', countKey: 'crm_quotations' },
];

type MailRow = {
  name: string;
  subject?: string;
  sender?: string;
  recipients?: string;
  communication_date?: string;
  sent_or_received?: string;
  direction?: string;
  counterparty?: string;
  display_name?: string;
  unread?: number;
  content?: string;
  reference_doctype?: string;
  reference_name?: string;
};

type Compose = {
  recipients: string;
  subject: string;
  content: string;
  reference_doctype?: string | null;
  reference_name?: string | null;
};

export function Mail() {
  const [folder, setFolder] = useState('inbox');
  const [data, setData] = useState<{ counts: Record<string, number>; rows: MailRow[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<MailRow | null>(null);
  const [compose, setCompose] = useState<Compose | null>(null);

  async function load(f = folder) {
    setLoading(true);
    try {
      const d = await apiGet('customer_portal.api.crm.crm_mail_data', {
        folder: f,
        tab: 'all',
        search: '',
        limit: 100,
        offset: 0,
      });
      setData(d || { counts: {}, rows: [] });
    } catch {
      setData({ counts: {}, rows: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(folder);
  }, [folder]);

  const counts = data?.counts ?? {};

  return (
    <View style={{ flex: 1 }}>
      {/* Folder chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.folders} contentContainerStyle={styles.foldersInner}>
        {FOLDERS.map((f) => {
          const n = f.countKey ? counts[f.countKey] : undefined;
          const active = folder === f.key;
          return (
            <Pressable key={f.key} style={[styles.folder, active && styles.folderActive]} onPress={() => setFolder(f.key)}>
              <Text style={[styles.folderText, active && styles.folderTextActive]}>
                {f.label}
                {n ? ` ${n}` : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading && !data?.rows?.length ? (
        <ActivityIndicator color={Brand.maroon} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data?.rows ?? []}
          keyExtractor={(r) => r.name}
          contentContainerStyle={{ padding: 16, paddingBottom: 90, gap: 8 }}
          ListEmptyComponent={<Text style={styles.empty}>No emails in this folder.</Text>}
          renderItem={({ item: r }) => (
            <Pressable style={styles.row} onPress={() => setOpen(r)}>
              {r.unread ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowName, r.unread ? styles.rowNameUnread : null]} numberOfLines={1}>
                  {r.display_name || r.counterparty || '(unknown)'}
                </Text>
                <Text style={styles.rowSubject} numberOfLines={1}>
                  {r.subject || '(no subject)'}
                </Text>
              </View>
              <Text style={styles.rowDate}>{fmtDate(r.communication_date)}</Text>
            </Pressable>
          )}
        />
      )}

      {/* Compose FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => setCompose({ recipients: '', subject: '', content: '' })}>
        <Ionicons name="create-outline" size={22} color="#fff" />
      </Pressable>

      {/* Message viewer */}
      <Modal visible={!!open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(null)}>
        <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {open?.subject || '(no subject)'}
            </Text>
            <Pressable onPress={() => setOpen(null)} hitSlop={10}>
              <Ionicons name="close" size={24} color={Brand.text2} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 18, gap: 8 }}>
            <Text style={styles.metaLine}>
              {open?.direction === 'Sent' ? 'To: ' : 'From: '}
              {open?.counterparty}
            </Text>
            <Text style={styles.metaLine}>{fmtDateTime(open?.communication_date)}</Text>
            {open?.reference_doctype ? (
              <Text style={styles.refLine}>
                {open.reference_doctype}: {open.reference_name}
              </Text>
            ) : null}
            <Text style={styles.bodyText}>{stripHtml(open?.content) || '(no content)'}</Text>
          </ScrollView>
          <View style={styles.sheetFooter}>
            <Pressable
              style={styles.replyBtn}
              onPress={() => {
                const r = open!;
                setOpen(null);
                setCompose({
                  recipients: r.counterparty || '',
                  subject: /^re:/i.test(r.subject || '') ? r.subject! : `Re: ${r.subject || ''}`,
                  content: '',
                  reference_doctype: r.reference_doctype || null,
                  reference_name: r.reference_name || null,
                });
              }}>
              <Ionicons name="arrow-undo-outline" size={18} color="#fff" />
              <Text style={styles.replyText}>Reply</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Compose */}
      <ComposeModal compose={compose} onClose={() => setCompose(null)} onSent={() => load(folder)} />
    </View>
  );
}

function ComposeModal({
  compose,
  onClose,
  onSent,
}: {
  compose: Compose | null;
  onClose: () => void;
  onSent: () => void;
}) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (compose) {
      setTo(compose.recipients);
      setSubject(compose.subject);
      setBody(compose.content);
    }
  }, [compose]);

  async function send() {
    if (!to.trim() || sending) return;
    setSending(true);
    try {
      const r = await apiPost('customer_portal.api.crm.crm_send_email', {
        recipients: to.trim(),
        subject: subject.trim(),
        content: body.trim().replace(/\n/g, '<br>'),
        reference_doctype: compose?.reference_doctype || undefined,
        reference_name: compose?.reference_name || undefined,
      });
      onClose();
      onSent();
      Alert.alert('Email ' + (r?.status === 'sent' ? 'sent' : 'recorded'), `To ${to.trim()}`);
    } catch (e: any) {
      Alert.alert('Could not send', e?.message || 'Unknown error');
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal visible={!!compose} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>New email</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={Brand.text2} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
            <Field label="To" value={to} onChange={setTo} placeholder="email@customer.com" keyboardType="email-address" />
            <Field label="Subject" value={subject} onChange={setSubject} placeholder="Subject" />
            <View>
              <Text style={styles.fieldLabel}>Message</Text>
              <TextInput
                style={styles.bodyInput}
                value={body}
                onChangeText={setBody}
                placeholder="Write your message…"
                placeholderTextColor={Brand.text3}
                multiline
              />
            </View>
          </ScrollView>
          <View style={styles.sheetFooter}>
            <Pressable style={[styles.sendBtn, (!to.trim() || sending) && { opacity: 0.5 }]} onPress={send} disabled={!to.trim() || sending}>
              {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send email</Text>}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Brand.text3}
        autoCapitalize="none"
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  folders: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: Brand.border, backgroundColor: Brand.surface },
  foldersInner: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  folder: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Brand.surface2 },
  folderActive: { backgroundColor: Brand.maroon },
  folderText: { fontSize: 12.5, fontWeight: '600', color: Brand.text2 },
  folderTextActive: { color: '#fff' },
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
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Brand.maroon },
  dotSpacer: { width: 8 },
  rowName: { fontSize: 13.5, fontWeight: '600', color: Brand.text },
  rowNameUnread: { fontWeight: '700' },
  rowSubject: { fontSize: 12, color: Brand.text3, marginTop: 2 },
  rowDate: { fontSize: 11, color: Brand.text3 },
  empty: { textAlign: 'center', color: Brand.text3, marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Brand.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  sheet: { flex: 1, backgroundColor: Brand.bg },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
    gap: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: Brand.text, flex: 1 },
  metaLine: { fontSize: 12.5, color: Brand.text2 },
  refLine: { fontSize: 11.5, color: Brand.maroon, fontWeight: '600' },
  bodyText: { fontSize: 14.5, color: Brand.text, lineHeight: 21, marginTop: 8 },
  sheetFooter: { padding: 16, borderTopWidth: 1, borderTopColor: Brand.border, backgroundColor: Brand.surface },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 10,
    backgroundColor: Brand.maroon,
  },
  replyText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Brand.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14.5,
    color: Brand.text,
    backgroundColor: Brand.surface,
  },
  bodyInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14.5,
    color: Brand.text,
    backgroundColor: Brand.surface,
    textAlignVertical: 'top',
  },
  sendBtn: { height: 50, borderRadius: 10, backgroundColor: Brand.maroon, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
