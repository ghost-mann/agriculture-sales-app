import { Brand } from '@/constants/theme';

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

export function fmtDate(s?: string | null): string {
  if (!s) return '—';
  const d = new Date(String(s).replace(' ', 'T'));
  if (isNaN(d.getTime())) return String(s).slice(0, 10);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fmtDateTime(s?: string | null): string {
  if (!s) return '—';
  const d = new Date(String(s).replace(' ', 'T'));
  if (isNaN(d.getTime())) return String(s).slice(0, 16);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${fmtDate(s)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Map an ERPNext status string → a badge tone (bg + fg). Mirrors the web
// statusClass helper in Frontend/shared/utils.js.
export function statusTone(s?: string | null): { bg: string; fg: string } {
  const k = String(s || '').toLowerCase();
  if (/complet|paid|closed|delivered|resolved/.test(k)) return { bg: Brand.goodSoft, fg: Brand.good };
  if (k === 'to deliver' || k === 'to bill' || k.includes('partial')) return { bg: Brand.infoSoft, fg: Brand.info };
  if (/cancel|overdue|rejected|lost|unpaid/.test(k)) return { bg: Brand.badSoft, fg: Brand.bad };
  if (/draft|submitted|open|review|hold|pending/.test(k)) return { bg: Brand.warnSoft, fg: Brand.warn };
  return { bg: Brand.surface2, fg: Brand.text2 };
}

// Render Frappe HTML email/message bodies as plain text for native display.
export function stripHtml(s?: string | null): string {
  return String(s || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
