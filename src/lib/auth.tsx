import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import * as api from './api';

// The "who am I" shape, derived from customer_portal.api.customer.get_my_context.
// The role flags drive the whole app's access control: customers get Shop +
// Portal; staff (is_staff/is_crm) additionally get CRM and impersonation.
export type Identity = {
  user: string | null;
  fullName: string | null;
  isStaff: boolean;
  isCrm: boolean;
  isAccountManager: boolean;
};

type AuthState = {
  ready: boolean; // finished checking any stored session
  authed: boolean;
  identity: Identity | null;
  error: string | null;
  signIn: (usr: string, pwd: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function toIdentity(ctx: any): Identity {
  return {
    user: ctx?.user ?? null,
    fullName: ctx?.full_name ?? null,
    isStaff: !!ctx?.is_staff,
    isCrm: !!ctx?.is_crm,
    isAccountManager: !!ctx?.is_account_manager,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadIdentity() {
    const ctx = await api.apiGet('customer_portal.api.customer.get_my_context');
    setIdentity(toIdentity(ctx));
  }

  // On launch, restore any persisted session and validate it. Whatever happens
  // (SecureStore error, unreachable backend, expired session), we MUST flip
  // `ready` so the app leaves the loading spinner — hence the finally.
  useEffect(() => {
    (async () => {
      try {
        await api.loadSession();
        if (api.hasSession()) {
          try {
            await loadIdentity();
          } catch {
            await api.logout(); // stale/expired/unreachable → force re-login
            setIdentity(null);
          }
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  async function signIn(usr: string, pwd: string) {
    setError(null);
    try {
      await api.login(usr.trim(), pwd);
      await loadIdentity();
    } catch (e: any) {
      setError(e?.message || 'Could not sign in.');
      throw e;
    }
  }

  async function signOut() {
    await api.logout();
    setIdentity(null);
  }

  return (
    <AuthContext.Provider
      value={{
        ready,
        authed: !!identity,
        identity,
        error,
        signIn,
        signOut,
        refresh: loadIdentity,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
