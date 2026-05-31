import Constants from 'expo-constants';

// Base URL of the Frappe backend (the `customer_portal` app / `kaitet` site).
//
// Resolution order:
//   1. EXPO_PUBLIC_API_URL env var (set at build/start time)
//   2. app.json → expo.extra.apiUrl
//   3. the dev fallback below
//
// The fallback points at this dev machine's LAN IP so a phone on the same Wi-Fi
// running Expo Go can reach the bench. `localhost` would resolve to the *device*,
// not the dev machine, so it must be the LAN IP (or a tunnel/public URL).
const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

export const API_URL: string = (
  process.env.EXPO_PUBLIC_API_URL ||
  fromExtra ||
  'http://192.168.1.68:8001'
).replace(/\/+$/, '');

// Frappe resolves which site to serve from the HTTP Host header. When the app
// connects by IP (e.g. 192.168.1.68:8001), that header is the IP, which matches
// no site → "<ip> does not exist". Setting SITE_HOST makes the client send the
// real site name as the Host header so Frappe serves it. Configure via
// app.json → expo.extra.siteHost or EXPO_PUBLIC_SITE_HOST. Null = don't override
// (correct once you point API_URL at a real domain that maps to the site).
export const SITE_HOST: string | null =
  process.env.EXPO_PUBLIC_SITE_HOST ||
  (Constants.expoConfig?.extra as { siteHost?: string } | undefined)?.siteHost ||
  null;

// Network requests abort after this long instead of hanging forever (which
// otherwise leaves the app stuck on a spinner with no error).
export const REQUEST_TIMEOUT_MS = 15000;
