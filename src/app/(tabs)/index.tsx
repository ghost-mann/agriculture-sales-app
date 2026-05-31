import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '@/components/app-header';
import { CustomerPickerSheet } from '@/components/customer-picker-sheet';
import { Brand } from '@/constants/theme';
import { CartSheet } from '@/features/shop/components/CartSheet';
import { ItemCard } from '@/features/shop/components/ItemCard';
import { Toast } from '@/features/shop/components/Toast';
import { useShop } from '@/features/shop/store';

function CartButton({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable style={hdr.cartBtn} onPress={onPress} hitSlop={8}>
      <Ionicons name="cart-outline" size={20} color="#fff" />
      {count > 0 ? (
        <View style={hdr.badge}>
          <Text style={hdr.badgeText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function ShopScreen() {
  const {
    ctx,
    loadingCtx,
    ctxError,
    impersonate,
    categories,
    items,
    loadingItems,
    filters,
    cart,
    hasCustomer,
    bootstrap,
    setSearch,
    setCategory,
    loadItems,
    addToCart,
    updateQty,
    setImpersonate,
  } = useShop();

  const [cartOpen, setCartOpen] = useState(false);
  const [impOpen, setImpOpen] = useState(false);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Debounce the search box → reload items 250ms after typing stops.
  useEffect(() => {
    const t = setTimeout(() => loadItems(), 250);
    return () => clearTimeout(t);
  }, [filters.search, loadItems]);

  // qty-in-cart lookup so item cards can show steppers
  const qtyByCode = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of cart?.items ?? []) m[l.item_code] = l.qty;
    return m;
  }, [cart]);

  const isStaff = !!ctx?.is_staff;
  const noCustomer = isStaff && !hasCustomer();

  return (
    <View style={styles.root}>
      <AppHeader
        title="Shop"
        subtitle="Karen Roses"
        right={<CartButton count={cart?.item_count ?? 0} onPress={() => setCartOpen(true)} />}
      />

      {/* Staff impersonation bar */}
      {isStaff ? (
        <Pressable style={styles.impBar} onPress={() => setImpOpen(true)}>
          <Ionicons name="eye-outline" size={16} color={Brand.maroon} />
          <Text style={styles.impText} numberOfLines={1}>
            {impersonate || ctx?.customer
              ? `Viewing as: ${ctx?.customer_name || impersonate || ctx?.customer}`
              : 'Pick a customer to shop'}
          </Text>
          <Ionicons name="chevron-down" size={15} color={Brand.maroon} />
        </Pressable>
      ) : null}

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Brand.text3} />
        <TextInput
          style={styles.search}
          placeholder="Search varieties, brands, codes…"
          placeholderTextColor={Brand.text3}
          defaultValue={filters.search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {/* Category chips */}
      {categories.length > 0 ? (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}>
            <Chip label="All" active={!filters.category} onPress={() => setCategory(null)} />
            {categories.map((c) => (
              <Chip
                key={c.item_group}
                label={`${c.item_group} (${c.cnt})`}
                active={filters.category === c.item_group}
                onPress={() => setCategory(c.item_group)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Catalog */}
      {loadingCtx ? (
        <Center>
          <ActivityIndicator color={Brand.green} size="large" />
        </Center>
      ) : ctxError ? (
        <Center>
          <Ionicons name="storefront-outline" size={36} color={Brand.text3} />
          <Text style={styles.msg}>{ctxError}</Text>
        </Center>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.name}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            noCustomer ? (
              <View style={styles.banner}>
                <Text style={styles.bannerText}>
                  You're staff — pick a customer above to add items and build their cart.
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            loadingItems ? (
              <ActivityIndicator color={Brand.green} style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.msg}>No items match.</Text>
            )
          }
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              qty={qtyByCode[item.item_code] ?? 0}
              onAdd={() => addToCart(item.item_code, 1)}
              onInc={() => updateQty(item.item_code, (qtyByCode[item.item_code] ?? 0) + 1)}
              onDec={() => updateQty(item.item_code, (qtyByCode[item.item_code] ?? 0) - 1)}
            />
          )}
        />
      )}

      <Toast />
      <CartSheet visible={cartOpen} onClose={() => setCartOpen(false)} />
      <CustomerPickerSheet
        visible={impOpen}
        onClose={() => setImpOpen(false)}
        value={impersonate}
        onPick={(name) => setImpersonate(name)}
        title="Shop as customer"
      />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

const hdr = StyleSheet.create({
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Brand.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Brand.surface,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  impBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.maroonSoft,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  impText: { flex: 1, color: Brand.maroon, fontSize: 12.5, fontWeight: '600' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: Brand.surface2,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  search: { flex: 1, fontSize: 14.5, color: Brand.text },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  chipActive: { backgroundColor: Brand.green, borderColor: Brand.green },
  chipText: { fontSize: 12.5, color: Brand.text2, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  msg: { color: Brand.text3, fontSize: 14, textAlign: 'center', marginTop: 30 },
  banner: {
    backgroundColor: Brand.maroonSoft,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  bannerText: { color: Brand.maroon, fontSize: 12.5, lineHeight: 18 },
});
