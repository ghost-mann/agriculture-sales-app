// Frappe API client for the native app.
//
// Auth model: Frappe issues a session cookie (`sid`) on login. React Native's
// fetch keeps cookies in a native jar, but we ALSO capture `sid` from the
// login response's Set-Cookie header (readable in RN, unlike browsers) and
// persist it in SecureStore so the session survives app restarts — we then
// attach it explicitly as a `Cookie` header on every call.
//
// CSRF: Frappe enforces CSRF on authenticated POSTs. After login we GET a fresh
// token (customer_portal.api.customer.get_csrf_token) and send it as
// X-Frappe-CSRF-Token; on a CSRF failure we refresh once and retry.

import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';

const SID_KEY = 'frappe_sid';
const CSRF_KEY = 'frappe_csrf';

let sid: string | null = null;
let csrf: string | null = null;

export class AuthError extends Error {}

// ── session persistence ──────────────────────────────────────────────────────

export async function loadSession(): Promise<string | null> {
  sid = await SecureStore.getItemAsync(SID_KEY);
  csrf = await SecureStore.getItemAsync(CSRF_KEY);
  return sid;
}

export function hasSession(): boolean {
  return !!sid;
}

async function setSid(v: string | null) {
  sid = v;
  if (v) await SecureStore.setItemAsync(SID_KEY, v);
  else await SecureStore.deleteItemAsync(SID_KEY);
}

async function setCsrf(v: string | null) {
  csrf = v;
  if (v) await SecureStore.setItemAsync(CSRF_KEY, v);
  else await SecureStore.deleteItemAsync(CSRF_KEY);
}

function extractSid(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const m = setCookie.match(/sid=([^;,\s]+)/);
  return m && m[1] !== 'Guest' ? m[1] : null;
}

// ── low-level helpers ────────────────────────────────────────────────────────

function baseHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (sid) h.Cookie = `sid=${sid}`;
  return h;
}

function isCsrfError(data: any): boolean {
  const s = String(data?.exc_type || data?._error_message || data?.message || '').toLowerCase();
  return s.includes('csrf');
}

async function parse(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function finalize(res: Response, data: any) {
  if (res.status === 401 || res.status === 403) {
    throw new AuthError(data?._error_message || data?.message || 'Your session has expired.');
  }
  if (!res.ok) {
    throw new Error(data?._error_message || data?.exc_type || data?.message || `HTTP ${res.status}`);
  }
  return data?.message;
}

// ── auth ─────────────────────────────────────────────────────────────────────

export async function login(usr: string, pwd: string): Promise<void> {
  const body = new URLSearchParams({ usr, pwd }).toString();
  const res = await fetch(`${API_URL}/api/method/login`, {
    method: 'POST',
    headers: { ...baseHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await parse(res);
  if (!res.ok) {
    throw new AuthError(data?.message || 'Invalid email or password.');
  }
  const newSid = extractSid(res.headers.get('set-cookie'));
  if (newSid) await setSid(newSid);
  await refreshCsrf();
}

export async function refreshCsrf(): Promise<void> {
  try {
    const r = await apiGet('customer_portal.api.customer.get_csrf_token');
    if (r?.csrf_token) await setCsrf(r.csrf_token);
  } catch {
    /* non-fatal — GETs don't need CSRF; first POST will retry */
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/method/logout`, { method: 'GET', headers: baseHeaders() });
  } catch {
    /* clear local session regardless */
  }
  await setSid(null);
  await setCsrf(null);
}

// ── method calls ─────────────────────────────────────────────────────────────

export async function apiGet(method: string, params: Record<string, any> = {}): Promise<any> {
  const qs = new URLSearchParams();
  for (const k in params) if (params[k] != null) qs.append(k, String(params[k]));
  const url = `${API_URL}/api/method/${method}${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url, { method: 'GET', headers: baseHeaders() });
  return finalize(res, await parse(res));
}

async function rawPost(method: string, args: Record<string, any>) {
  const body = new URLSearchParams();
  for (const k in args) {
    if (args[k] == null) continue;
    body.append(k, typeof args[k] === 'object' ? JSON.stringify(args[k]) : String(args[k]));
  }
  const headers: Record<string, string> = {
    ...baseHeaders(),
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (csrf) headers['X-Frappe-CSRF-Token'] = csrf;
  const res = await fetch(`${API_URL}/api/method/${method}`, {
    method: 'POST',
    headers,
    body: body.toString(),
  });
  return { res, data: await parse(res) };
}

export async function apiPost(method: string, args: Record<string, any> = {}): Promise<any> {
  let { res, data } = await rawPost(method, args);
  if (!res.ok && isCsrfError(data)) {
    await refreshCsrf();
    ({ res, data } = await rawPost(method, args));
  }
  return finalize(res, data);
}
