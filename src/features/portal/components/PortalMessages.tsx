import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { usePortal } from '../store';
import { Thread } from './Thread';

// The customer ↔ account-manager conversation: the whole message history as a
// thread + a composer. Both sides send and receive — the customer (or staff
// acting on the account) sends via send_message; the team's emails to the
// customer come back as Received messages in list_messages.
export function PortalMessages() {
  const { loadMessageThread, sendMessage } = usePortal();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Thread
          emptyHint="No messages yet — send one to your account manager below."
          load={loadMessageThread}
          send={sendMessage}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
