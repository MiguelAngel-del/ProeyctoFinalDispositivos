import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { apiFetch, API_URL } from '../services/api';

export default function StoreScreen() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await apiFetch('/productos');
      if (res.ok) setProductos(res.data || []);
      // debug: detect duplicate keys
      try {
        const keys = (res.data || []).map((item, idx) => String(item.id_producto ?? item.id ?? item._id ?? idx));
        const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
        if (dup.length) console.warn('StoreScreen duplicate keys:', Array.from(new Set(dup)).slice(0,10));
      } catch (e) { console.warn('StoreScreen key check failed', e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        keyExtractor={(item, index) => `store-${String(item.id_producto ?? item.id ?? item._id ?? index)}`}
        renderItem={({ item }) => {
          // ensure URL is absolute and encoded
          let uri = item.url_imagen || '';
          if (uri && !uri.startsWith('http')) {
            // relative path, prepend API base
            if (uri.startsWith('/')) uri = `${API_URL}${uri}`;
            else uri = `${API_URL}/${uri}`;
          }
          if (uri) uri = encodeURI(uri);
          return (
            <View style={styles.card}>
              {uri ? <Image source={{ uri }} style={styles.image} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nombre}</Text>
                <Text style={styles.price}>${item.precio_unitario}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  image: { width: 80, height: 80, marginRight: 12, borderRadius: 8 },
  name: { fontWeight: '700', fontSize: 16 },
  price: { color: '#1976D2', marginTop: 6, fontWeight: '600' },
});
