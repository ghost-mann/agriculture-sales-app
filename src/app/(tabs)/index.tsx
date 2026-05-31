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
import { CartBar } from '@/features/shop/components/CartBar';
import { CartSheet } from '@/features/shop/components/CartSheet';
import { ProductCard } from '@/features/shop/components/ProductCard';
import { ProductSheet } from '@/features/shop/components/ProductSheet';
import { Toast } from '@/features/shop/components/Toast';
import type { CatalogItem } from '@/features/shop/store';
import { useShop } from '@/features/shop/store';

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
  const [selected, setSelected] = useState<CatalogItem | null>(null);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const t = setTimeout(() => loadItems(), 250);
    return () => clearTimeout(t);
  }, [filters.search, loadItems]);

  const qtyByCode = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of cart?.items ?? []) m[l.item_code] = l.qty;
    return m;
  }, [cart]);

  const isStaff = !!ctx?.is_staff;
  const noCustomer = isStaff && !hasCustomer();

  return (
    <View style={styles.root}>
      <AppHeader title="Shop" subtitle="Browse & order fresh stems" />

      {/* Staff impersonation bar */}
      {isStaff ? (
        <Pressable style={styles.impBar} onPress={() => setImpOpen(true)}>
          <Ionicons name="eye-outline" size={16} color={Brand.maroon} />
          <Text style={styles.impText} numberOfLines={1}>
            {impersonate || ctx?.customer
              ? `Shopping for: ${ctx?.customer_name || impersonate || ctx?.customer}`
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
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
      ) : null}

      {/* Catalog grid */}
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
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.grid}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            noCustomer ? (
              <View style={styles.banner}>
                <Ionicons name="information-circle-outline" size={18} color={Brand.maroon} />
                <Text style={styles.bannerText}>
                  Pick a customer above to add items and build their cart.
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            loadingItems ? (
              <ActivityIndicator color={Brand.green} style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.msg}>No items match your search.</Text>
            )
          }
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              qty={qtyByCode[item.item_code] ?? 0}
              onOpen={() => setSelected(item)}
              onAdd={() => addToCart(item.item_code, 1)}
              onInc={() => updateQty(item.item_code, (qtyByCode[item.item_code] ?? 0) + 1)}
              onDec={() => updateQty(item.item_code, (qtyByCode[item.item_code] ?? 0) - 1)}
            />
          )}
        />
      )}

      <CartBar onOpen={() => setCartOpen(true)} />
      <Toast />
      <ProductSheet item={selected} onClose={() => setSelected(null)} />
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
  chipsRow: { flexGrow: 0, marginTop: 14, marginBottom: 6 },
  chips: { paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  chipActive: { backgroundColor: Brand.green, borderColor: Brand.green },
  chipText: { fontSize: 12.5, color: Brand.text2, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  grid: { padding: 16, paddingBottom: 96, gap: 14 },
  column: { gap: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  msg: { color: Brand.text3, fontSize: 14, textAlign: 'center', marginTop: 30 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.maroonSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  bannerText: { flex: 1, color: Brand.maroon, fontSize: 12.5, lineHeight: 18 },
});
