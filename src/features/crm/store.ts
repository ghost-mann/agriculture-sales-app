import { create } from 'zustand';

import { apiGet } from '@/lib/api';

const M = (m: string) => `customer_portal.api.crm.${m}`;

export type Section = 'overview' | 'mail' | 'leads' | 'opps' | 'prosp' | 'cust' | 'evt' | 'act';

export const SECTIONS: { key: Section; label: string; method: string }[] = [
  { key: 'overview', label: 'Overview', method: 'crm_dashboard_overview' },
  { key: 'mail', label: 'Mail', method: '' }, // self-managed (crm_mail_data); see Mail.tsx
  { key: 'leads', label: 'Leads', method: 'crm_dashboard_leads' },
  { key: 'opps', label: 'Opportunities', method: 'crm_dashboard_opportunities' },
  { key: 'prosp', label: 'Prospects', method: 'crm_dashboard_prospects' },
  { key: 'cust', label: 'Customers', method: 'crm_dashboard_customers' },
  { key: 'evt', label: 'Tasks', method: 'crm_dashboard_events_tasks' },
  { key: 'act', label: 'Activity', method: 'crm_dashboard_activity' },
];

function last30(): { date_from: string; date_to: string } {
  const p = (n: number) => String(n).padStart(2, '0');
  const ymd = (d: Date) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 30);
  return { date_from: ymd(from), date_to: ymd(now) };
}

type SectionState = { data: any | null; loading: boolean; err: string | null };

type CrmState = {
  section: Section;
  byKey: Record<string, SectionState>;
  setSection: (s: Section) => void;
  load: (s: Section, force?: boolean) => Promise<void>;
};

export const useCrm = create<CrmState>((set, get) => ({
  section: 'mail', // reps land in their inbox — comms is the day-to-day job
  byKey: {},

  setSection(s) {
    set({ section: s });
    get().load(s);
  },

  async load(s, force = false) {
    if (s === 'mail') return; // Mail.tsx fetches crm_mail_data itself
    const existing = get().byKey[s];
    if (existing?.data && !force) return; // cache; sections rarely change mid-session
    const method = SECTIONS.find((x) => x.key === s)!.method;
    set((st) => ({ byKey: { ...st.byKey, [s]: { data: existing?.data ?? null, loading: true, err: null } } }));
    try {
      const data = await apiGet(M(method), last30());
      set((st) => ({ byKey: { ...st.byKey, [s]: { data, loading: false, err: null } } }));
    } catch (e: any) {
      set((st) => ({
        byKey: { ...st.byKey, [s]: { data: null, loading: false, err: e?.message || 'Could not load.' } },
      }));
    }
  },
}));
