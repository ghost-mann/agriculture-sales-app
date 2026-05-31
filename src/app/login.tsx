import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
import { API_URL } from '@/lib/config';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setErr(null);
    try {
      await signIn(email, password);
      // On success the root navigator's auth guard swaps to the tab group.
    } catch (e: any) {
      setErr(e?.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.brandWrap}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>KR</Text>
            </View>
            <Text style={styles.brand}>Karen Roses</Text>
            <Text style={styles.tagline}>Customer & Sales Portal</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              placeholderTextColor={Brand.text3}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              editable={!busy}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Brand.text3}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              editable={!busy}
            />

            {err ? <Text style={styles.error}>{err}</Text> : null}

            <Pressable
              style={[styles.button, !canSubmit && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={!canSubmit}>
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.help}>
            Trouble signing in? Contact your account manager.
          </Text>

          <Text style={styles.host} numberOfLines={1}>
            {API_URL.replace(/^https?:\/\//, '')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 28 },
  brandWrap: { alignItems: 'center', gap: 10 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '700', fontSize: 22, letterSpacing: 0.5 },
  brand: { fontSize: 26, fontWeight: '600', color: Brand.text },
  tagline: {
    fontSize: 11,
    color: Brand.text3,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Brand.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Brand.text,
    backgroundColor: Brand.surface2,
  },
  error: {
    marginTop: 14,
    color: Brand.bad,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginTop: 22,
    height: 50,
    borderRadius: 10,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  help: { textAlign: 'center', fontSize: 13, color: Brand.text2, lineHeight: 18 },
  host: { textAlign: 'center', fontSize: 11, color: Brand.text3 },
});
