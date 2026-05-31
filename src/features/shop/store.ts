import { create } from 'zustand';

import { apiGet, apiPost } from '@/lib/api';

// ── Types mirrored from customer_portal.api.webshop / .customer ───────────────

export type ShopCtx = {
  user: string | null;
  full_name?: string | null;
  customer: string | null;
  customer_name?: string | null;
  currency?: string | null;
  is_staff?: boolean;
  needs_impersonation?: boolean;
};

export type CatalogItem = {
  name: string;
  item_code: string;
  item_name: string;
  web_item_name?: string;
  item_group?: string;
  brand?: string;
  stock_uom?: string;
  thumbnail?: string | null;
  website_image?: string | null;
  price_list_rate?: number | null;
  price_currency?: string | null;
  price_uom?: string | null;
  farms?: string[];
  in_season?: boolean;
};

export type CartLine = {
  item_code: string;
  item_name: string;
  qty: number;
  uom?: string;
  rate: number;
  amount: number;
  image?: string | null;
};

export type Cart = {
  name: string | null;
  currency: string | null;
  items: CartLine[];
  total_qty: number;
  total: number;
  item_count: number;
};

export type Category = { item_group: string; cnt: number };

type Toast = { kind: 'ok' | 'err' | 'info'; message: string } | null;

const W = (m: string) => `customer_portal.api.webshop.${m}`;
const C = (m: string) => `customer_portal.api.customer.${m}`;

type ShopState = {
  ctx: ShopCtx | null;
  loadingCtx: boolean;
  ctxError: string | null;

  impersonate: string | null;

  categories: Category[];
  items: CatalogItem[];
  loadingItems: boolean;

  filters: { category: string | null; search: string };

  cart: Cart | null;
  loadingCart: boolean;

  toast: Toast;

  // selectors
  hasCustomer: () => boolean;

  // actions
  setToast: (t: Toast) => void;
  bootstrap: () => Promise<void>;
  setImpersonate: (name: string | null) => Promise<void>;
  setSearch: (s: string) => void;
  setCategory: (g: string | null) => void;
  loadItems: () => Promise<void>;
  loadCart: () => Promise<void>;
  addToCart: (item_code: string, qty?: number) => Promise<void>;
  updateQty: (item_code: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  submitQuotation: (notes?: string) => Promise<{ name: string } | null>;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useShop = create<ShopState>((set, get) => ({
  ctx: null,
  loadingCtx: true,
  ctxError: null,
  impersonate: null,

  categories: [],
  items: [],
  loadingItems: false,

  filters: { category: null, search: '' },

  cart: null,
  loadingCart: false,

  toast: null,

  hasCustomer: () => {
    const { ctx, impersonate } = get();
    return !!ctx?.customer || !!impersonate;
  },

  setToast(t) {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: t });
    if (t) toastTimer = setTimeout(() => set({ toast: null }), 3500);
  },

  // customer arg threads staff impersonation through every backend call
  // (matches the web store's _args helper).
  async bootstrap() {
    set({ loadingCtx: true, ctxError: null });
    const im = get().impersonate;
    try {
      const ctx = await apiGet(C('get_my_context'), im ? { customer: im } : {});
      set({ ctx, loadingCtx: false });
      get().loadItems();
      get().loadCart();
      apiGet(W('list_categories'), im ? { customer: im } : {})
        .then((r) => set({ categories: r || [] }))
        .catch(() => set({ categories: [] }));
    } catch (e: any) {
      set({ loadingCtx: false, ctxError: e?.message || 'Could not open the shop.' });
    }
  },

  async setImpersonate(name) {
    set({
      impersonate: name || null,
      items: [],
      cart: null,
      categories: [],
    });
    await get().bootstrap();
    get().setToast(
      name ? { kind: 'info', message: `Shopping as ${name}` } : { kind: 'info', message: 'Stopped impersonating' },
    );
  },

  setSearch(s) {
    set({ filters: { ...get().filters, search: s } });
  },

  setCategory(g) {
    set({ filters: { ...get().filters, category: g } });
    get().loadItems();
  },

  async loadItems() {
    set({ loadingItems: true });
    const { filters, impersonate } = get();
    try {
      const r = await apiGet(W('list_items'), {
        ...(impersonate ? { customer: impersonate } : {}),
        category: filters.category,
        search: filters.search,
        limit: 120,
      });
      set({ items: r || [], loadingItems: false });
    } catch {
      set({ items: [], loadingItems: false });
    }
  },

  async loadCart() {
    set({ loadingCart: true });
    const im = get().impersonate;
    try {
      const cart = await apiGet(W('get_cart'), im ? { customer: im } : {});
      set({ cart, loadingCart: false });
    } catch {
      set({ loadingCart: false });
    }
  },

  async addToCart(item_code, qty = 1) {
    if (!get().hasCustomer()) {
      get().setToast({
        kind: 'err',
        message: get().ctx?.is_staff
          ? 'Pick a customer first (tap "Viewing as" up top).'
          : 'No customer account linked. Contact your account manager.',
      });
      return;
    }
    const im = get().impersonate;
    try {
      const cart = await apiPost(W('add_to_cart'), { ...(im ? { customer: im } : {}), item_code, qty });
      set({ cart });
      get().setToast({ kind: 'ok', message: 'Added to cart' });
    } catch (e: any) {
      get().setToast({ kind: 'err', message: e?.message || 'Could not add to cart' });
    }
  },

  async updateQty(item_code, qty) {
    if (!get().hasCustomer()) return;
    const im = get().impersonate;
    // optimistic local update
    const cart = get().cart;
    if (cart?.items) {
      const items = cart.items
        .map((r) => (r.item_code === item_code ? { ...r, qty } : r))
        .filter((r) => r.qty > 0);
      set({
        cart: {
          ...cart,
          items,
          total_qty: items.reduce((a, r) => a + r.qty, 0),
          item_count: items.length,
        },
      });
    }
    try {
      const fresh = await apiPost(W('update_qty'), { ...(im ? { customer: im } : {}), item_code, qty });
      set({ cart: fresh });
    } catch (e: any) {
      get().setToast({ kind: 'err', message: e?.message || 'Could not update quantity' });
      get().loadCart();
    }
  },

  async clearCart() {
    if (!get().hasCustomer()) return;
    const im = get().impersonate;
    try {
      const cart = await apiPost(W('clear_cart'), im ? { customer: im } : {});
      set({ cart });
    } catch {
      /* ignore */
    }
  },

  async submitQuotation(notes) {
    if (!get().hasCustomer()) return null;
    const im = get().impersonate;
    try {
      const r = await apiPost(W('submit_quotation'), { ...(im ? { customer: im } : {}), notes: notes || '' });
      set({ cart: null });
      get().loadCart();
      return r;
    } catch (e: any) {
      get().setToast({ kind: 'err', message: e?.message || 'Could not submit request' });
      throw e;
    }
  },
}));
