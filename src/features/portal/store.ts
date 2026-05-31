import { create } from 'zustand';

import { apiGet, apiPost } from '@/lib/api';

const C = (m: string) => `customer_portal.api.customer.${m}`;

export type PortalCtx = {
  user: string | null;
  full_name?: string | null;
  customer: string | null;
  customer_name?: string | null;
  customer_group?: string | null;
  territory?: string | null;
  currency?: string | null;
  payment_terms?: string | null;
  manager?: { user: string; name: string; email: string } | null;
  is_staff?: boolean;
  needs_impersonation?: boolean;
};

export type Kind = 'orders' | 'shipments' | 'claims' | 'invoices' | 'messages';

export type Overview = {
  kpis: { open_orders: number; in_flight: number; overdue: number; open_claims: number };
  recent_orders: any[];
  recent_shipments: any[];
};

export type ClaimMessage = {
  name: string;
  sender: string;
  sender_full_name?: string;
  content: string;
  communication_date: string;
  sent_or_received: 'Sent' | 'Received';
};

type ListState = { rows: any[] | null; err: string | null };

type PortalState = {
  ctx: PortalCtx | null;
  loading: boolean;
  loadError: string | null;
  impersonate: string | null;

  overview: Overview | null;
  lists: Record<Kind, ListState>;

  hasCustomer: () => boolean;

  bootstrap: () => Promise<void>;
  setImpersonate: (name: string | null) => Promise<void>;
  loadOverview: () => Promise<void>;
  loadList: (kind: Kind) => Promise<void>;
  getDoc: (kind: Kind, name: string) => Promise<any>;
  loadClaimMessages: (name: string) => Promise<ClaimMessage[]>;
  replyToClaim: (name: string, content: string) => Promise<void>;
  replyToMessage: (name: string, content: string) => Promise<void>;
};

const emptyLists = (): Record<Kind, ListState> => ({
  orders: { rows: null, err: null },
  shipments: { rows: null, err: null },
  claims: { rows: null, err: null },
  invoices: { rows: null, err: null },
  messages: { rows: null, err: null },
});

const LIST_METHOD: Record<Kind, string> = {
  orders: 'list_orders',
  shipments: 'list_shipments',
  claims: 'list_claims',
  invoices: 'list_invoices',
  messages: 'list_messages',
};

export const usePortal = create<PortalState>((set, get) => ({
  ctx: null,
  loading: true,
  loadError: null,
  impersonate: null,

  overview: null,
  lists: emptyLists(),

  hasCustomer: () => {
    const { ctx, impersonate } = get();
    return !!ctx?.customer || !!impersonate;
  },

  async bootstrap() {
    set({ loading: true, loadError: null });
    const im = get().impersonate;
    try {
      const ctx = await apiGet(C('get_my_context'), im ? { customer: im } : {});
      set({ ctx, loading: false });
      if (ctx?.customer) get().loadOverview();
    } catch (e: any) {
      set({ loading: false, loadError: e?.message || 'Could not load your account.' });
    }
  },

  async setImpersonate(name) {
    set({ impersonate: name || null, overview: null, lists: emptyLists() });
    await get().bootstrap();
  },

  async loadOverview() {
    const im = get().impersonate;
    try {
      const ov = await apiGet(C('get_overview'), im ? { customer: im } : {});
      set({ overview: ov });
    } catch {
      set({ overview: null });
    }
  },

  async loadList(kind) {
    set((s) => ({ lists: { ...s.lists, [kind]: { rows: null, err: null } } }));
    const im = get().impersonate;
    try {
      const rows = (await apiGet(C(LIST_METHOD[kind]), im ? { customer: im } : {})) || [];
      set((s) => ({ lists: { ...s.lists, [kind]: { rows, err: null } } }));
    } catch (e: any) {
      set((s) => ({ lists: { ...s.lists, [kind]: { rows: [], err: e?.message || 'Could not load.' } } }));
    }
  },

  async getDoc(kind, name) {
    const im = get().impersonate;
    return apiGet(C('get_doc'), { ...(im ? { customer: im } : {}), doctype_kind: kind, name });
  },

  async loadClaimMessages(name) {
    const im = get().impersonate;
    return (await apiGet(C('list_claim_messages'), { ...(im ? { customer: im } : {}), name })) || [];
  },

  async replyToClaim(name, content) {
    const im = get().impersonate;
    const html = String(content || '').trim().replace(/\n/g, '<br>');
    await apiPost(C('reply_to_claim'), { ...(im ? { customer: im } : {}), name, content: html });
  },

  async replyToMessage(name, content) {
    const im = get().impersonate;
    const html = String(content || '').trim().replace(/\n/g, '<br>');
    await apiPost(C('reply_to_message'), { ...(im ? { customer: im } : {}), name, content: html });
    get().loadList('messages');
  },
}));
