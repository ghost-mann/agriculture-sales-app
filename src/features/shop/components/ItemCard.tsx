import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { fmtMoney, imageUrl } from '@/lib/format';
import type { CatalogItem } from '../store';

type Props = {
  item: CatalogItem;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
};

function ItemCardBase({ item, qty, onAdd, onInc, onDec }: Props) {
  const img = imageUrl(item.thumbnail || item.website_image);
  const price = item.price_list_rate;

  return (
    <View style={styles.card}>
      <View style={styles.thumb}>
        {img ? (
          <Image source={{ uri: img }} style={styles.img} contentFit="cover" transition={120} />
        ) : (
          <Ionicons name="flower-outline" size={26} color={Brand.text3} />
        )}
      </View>

      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={2}>
          {item.web_item_name || item.item_name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[item.brand, item.item_group].filter(Boolean).join(' · ') || item.item_code}
        </Text>
        <View style={styles.tags}>
          {item.in_season ? (
            <View style={[styles.tag, styles.seasonTag]}>
              <Text style={styles.seasonText}>In season</Text>
            </View>
          ) : null}
          {(item.farms || []).slice(0, 1).map((f) => (
            <View key={f} style={styles.tag}>
              <Text style={styles.tagText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>
          {price != null ? fmtMoney(price, item.price_currency) : '—'}
        </Text>
        {price != null && item.price_uom ? (
          <Text style={styles.uom}>/ {item.price_uom}</Text>
        ) : null}

        {qty > 0 ? (
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={onDec} hitSlop={6}>
              <Ionicons name="remove" size={16} color={Brand.green} />
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable style={styles.stepBtn} onPress={onInc} hitSlop={6}>
              <Ionicons name="add" size={16} color={Brand.green} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.addBtn} onPress={onAdd} hitSlop={6}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export const ItemCard = memo(ItemCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Brand.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Brand.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%' },
  mid: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontWeight: '600', color: Brand.text },
  meta: { fontSize: 11.5, color: Brand.text3 },
  tags: { flexDirection: 'row', gap: 5, marginTop: 3 },
  tag: {
    backgroundColor: Brand.surface2,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: { fontSize: 9.5, color: Brand.text2, fontWeight: '500' },
  seasonTag: { backgroundColor: Brand.greenSoft },
  seasonText: { fontSize: 9.5, color: Brand.green, fontWeight: '600' },
  right: { alignItems: 'flex-end', gap: 2, minWidth: 78 },
  price: { fontSize: 14, fontWeight: '700', color: Brand.text },
  uom: { fontSize: 10, color: Brand.text3, marginTop: -2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Brand.green,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 4,
  },
  addText: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Brand.green,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 22, textAlign: 'center', fontSize: 13.5, fontWeight: '700', color: Brand.text },
});
