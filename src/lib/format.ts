import { API_URL } from './config';

// "$1,234.00" for USD, "KES 1,234.00" otherwise. Mirrors the web app's fmtMoney.
export function fmtMoney(n: number | null | undefined, ccy?: string | null): string {
  if (n == null || isNaN(Number(n))) return '—';
  const v = Number(n);
  const sign = ccy === 'USD' ? '$' : ccy ? `${ccy} ` : '';
  return sign + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Frappe stores file/image fields as site-relative paths ("/files/x.jpg").
// Resolve them against the backend host so <Image> can load them on a device.
export function imageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function initials(s?: string | null): string {
  if (!s) return '?';
  const parts = String(s)
    .replace(/<[^>]+>/g, '')
    .trim()
    .split(/[\s.@_-]+/)
    .filter((x) => x && !/^\d+$/.test(x));
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}
