import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { fmtMoney, imageUrl } from '@/lib/format';
import type { CatalogItem } from '../store';

type Props = {
  item: CatalogItem;
  qty: number;
  onOpen: () => void;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
};

// A modern e-commerce grid tile: big image up top with an add/stepper control
// floating on it, details below. Tapping the tile opens the product detail.
function ProductCardBase({ item, qty, onOpen, onAdd, onInc, onDec }: Props) {
  const img = imageUrl(item.thumbnail || item.website_image);
  const price = item.price_list_rate;
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Pressable style={styles.card} onPress={onOpen}>
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
          <View style={styles.placeholder}>
            <Ionicons name="flower-outline" size={30} color={Brand.text3} />
          </View>
        )}

        {item.in_season ? (
          <View style={styles.seasonBadge}>
            <Text style={styles.seasonText}>In season</Text>
          </View>
        ) : null}

        {qty > 0 ? (
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={onDec} hitSlop={8}>
              <Ionicons name="remove" size={16} color="#fff" />
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable style={styles.stepBtn} onPress={onInc} hitSlop={8}>
              <Ionicons name="add" size={16} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.addBtn} onPress={onAdd} hitSlop={8}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {item.web_item_name || item.item_name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[item.brand, item.item_group].filter(Boolean).join(' · ') || item.item_code}
        </Text>
        <Text style={styles.price}>
          {price != null ? fmtMoney(price, item.price_currency) : 'Price on request'}
          {price != null && item.price_uom ? <Text style={styles.uom}>{` / ${item.price_uom}`}</Text> : null}
        </Text>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardBase);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageWrap: { width: '100%', aspectRatio: 1, backgroundColor: Brand.surface2 },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  seasonBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  seasonText: { fontSize: 9.5, fontWeight: '700', color: Brand.green },
  addBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  stepper: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.green,
    borderRadius: 999,
    paddingHorizontal: 4,
  },
  stepBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  qty: { color: '#fff', fontWeight: '700', fontSize: 13, minWidth: 18, textAlign: 'center' },
  body: { padding: 11, gap: 3 },
  name: { fontSize: 14, fontWeight: '600', color: Brand.text },
  meta: { fontSize: 11.5, color: Brand.text3 },
  price: { fontSize: 14, fontWeight: '700', color: Brand.text, marginTop: 2 },
  uom: { fontSize: 11, fontWeight: '500', color: Brand.text3 },
});
