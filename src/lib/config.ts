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
