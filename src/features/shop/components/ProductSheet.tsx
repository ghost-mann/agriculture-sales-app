import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { fmtMoney, imageUrl, stripHtml } from '@/lib/format';
import type { CatalogItem } from '../store';
import { useShop } from '../store';

export function ProductSheet({ item, onClose }: { item: CatalogItem | null; onClose: () => void }) {
  const { addToCart, cart } = useShop();
  const [qty, setQty] = useState(1);
  const [imgFailed, setImgFailed] = useState(false);

  // reset the quantity selector + image state each time a new product opens
  useEffect(() => {
    setQty(1);
    setImgFailed(false);
  }, [item?.item_code]);

  if (!item) return null;

  const img = imageUrl(item.thumbnail || item.website_image);
  const price = item.price_list_rate;
  const inCart = cart?.items?.find((l) => l.item_code === item.item_code)?.qty ?? 0;
  const desc = stripHtml(item.description);

  async function add() {
    await addToCart(item!.item_code, qty);
    onClose();
  }

  return (
    <Modal visible={!!item} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <Pressable style={styles.close} onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={24} color={Brand.text} />
        </Pressable>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View style={styles.imageWrap}>
            {img && !imgFailed ? (
              <Image
                source={{ uri: img }}
                style={styles.img}
                contentFit="cover"
                transition={150}
                onError={() => setImgFailed(true)}
              />
            ) : (
              <Ionicons name="flower-outline" size={56} color={Brand.text3} />
            )}
          </View>

          <View style={styles.body}>
            <Text style={styles.name}>{item.web_item_name || item.item_name}</Text>
            <Text style={styles.meta}>
              {[item.brand, item.item_group].filter(Boolean).join(' · ') || item.item_code}
            </Text>

            <View style={styles.tags}>
              {item.in_season ? (
                <View style={[styles.tag, styles.seasonTag]}>
                  <Text style={styles.seasonText}>In season</Text>
                </View>
              ) : null}
              {(item.farms || []).map((f) => (
                <View key={f} style={styles.tag}>
                  <Text style={styles.tagText}>{f}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.price}>
              {price != null ? fmtMoney(price, item.price_currency) : 'Price on request'}
              {price != null && item.price_uom ? <Text style={styles.uom}>{` / ${item.price_uom}`}</Text> : null}
            </Text>

            {desc ? <Text style={styles.desc}>{desc}</Text> : null}

            {inCart > 0 ? (
              <Text style={styles.inCart}>{inCart} already in your cart</Text>
            ) : null}
          </View>
        </ScrollView>

        {/* qty + add bar */}
        <View style={styles.footer}>
          <View style={styles.qtyBox}>
            <Pressable style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))} hitSlop={6}>
              <Ionicons name="remove" size={18} color={Brand.green} />
            </Pressable>
            <Text style={styles.qtyVal}>{qty}</Text>
            <Pressable style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)} hitSlop={6}>
              <Ionicons name="add" size={18} color={Brand.green} />
            </Pressable>
          </View>
          <Pressable style={styles.addBtn} onPress={add}>
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.addText}>Add to cart</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  close: {
    position: 'absolute',
    top: 12,
    right: 14,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.1,
    backgroundColor: Brand.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '100%', height: '100%' },
  body: { padding: 20, gap: 8 },
  name: { fontSize: 23, fontWeight: '700', color: Brand.text },
  meta: { fontSize: 13.5, color: Brand.text3 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { backgroundColor: Brand.surface2, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: Brand.text2, fontWeight: '500' },
  seasonTag: { backgroundColor: Brand.greenSoft },
  seasonText: { fontSize: 11, color: Brand.green, fontWeight: '700' },
  price: { fontSize: 20, fontWeight: '700', color: Brand.text, marginTop: 8 },
  uom: { fontSize: 13, fontWeight: '500', color: Brand.text3 },
  desc: { fontSize: 14, color: Brand.text2, lineHeight: 21, marginTop: 8 },
  inCart: { fontSize: 12.5, color: Brand.green, fontWeight: '600', marginTop: 10 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    backgroundColor: Brand.surface,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  qtyBtn: { width: 38, height: 44, alignItems: 'center', justifyContent: 'center' },
  qtyVal: { minWidth: 28, textAlign: 'center', fontSize: 16, fontWeight: '700', color: Brand.text },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    backgroundColor: Brand.green,
  },
  addText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
