import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Brand } from '@/constants/theme';
import { fmtDateTime, stripHtml } from '@/lib/format';
import type { ClaimMessage } from '../store';

/**
 * Two-way conversation thread reused for claims and account-manager messages.
 * `load` fetches the messages; `send` posts a reply. Customer's own posts
 * (sent_or_received === 'Sent') align right.
 */
export function Thread({
  load,
  send,
  emptyHint,
}: {
  load: () => Promise<ClaimMessage[]>;
  send: (content: string) => Promise<void>;
  emptyHint: string;
}) {
  const [msgs, setMsgs] = useState<ClaimMessage[] | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setMsgs(await load());
    } catch {
      setMsgs([]);
    }
  }, [load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onSend() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await send(body);
      setText('');
      await refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Conversation</Text>

      {msgs == null ? (
        <ActivityIndicator color={Brand.green} style={{ marginVertical: 16 }} />
      ) : msgs.length === 0 ? (
        <Text style={styles.empty}>{emptyHint}</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {msgs.map((m) => {
            const mine = m.sent_or_received === 'Sent';
            return (
              <View key={m.name} style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.author, mine && styles.authorMine]}>
                    {m.sender_full_name || m.sender}
                  </Text>
                  <Text style={[styles.body, mine && styles.bodyMine]}>{stripHtml(m.content)}</Text>
                  <Text style={[styles.time, mine && styles.timeMine]}>
                    {fmtDateTime(m.communication_date)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Write a reply…"
          placeholderTextColor={Brand.text3}
          value={text}
          onChangeText={setText}
          multiline
        />
        <Pressable
          style={[styles.send, (!text.trim() || sending) && { opacity: 0.5 }]}
          onPress={onSend}
          disabled={!text.trim() || sending}>
          {sending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sendText}>Send</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  empty: { color: Brand.text3, fontSize: 13, paddingVertical: 8 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '85%', borderRadius: 12, padding: 11, gap: 4 },
  bubbleTheirs: { backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.border },
  bubbleMine: { backgroundColor: Brand.greenSoft },
  author: { fontSize: 11, fontWeight: '700', color: Brand.text2 },
  authorMine: { color: Brand.greenDark },
  body: { fontSize: 13.5, color: Brand.text, lineHeight: 19 },
  bodyMine: { color: Brand.text },
  time: { fontSize: 10, color: Brand.text3 },
  timeMine: { color: Brand.green },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 6 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 14,
    color: Brand.text,
    backgroundColor: Brand.surface,
  },
  send: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
