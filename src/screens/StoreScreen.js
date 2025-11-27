
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { apiFetch, API_URL } from '../services/api';

export default function StoreScreen() {
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [resProd, resOff] = await Promise.all([
          apiFetch('/productos'),
          apiFetch('/ofertas'),
        ]);

        if (mounted) {
          setProductos(resProd.ok ? (resProd.data || []) : []);
          setOfertas(resOff.ok ? (resOff.data || []) : []);
          console.log('Ofertas:', resOff.data);
        }
      } catch (e) {
        console.warn('Error en fetch:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Crear índice de ofertas por id_producto
  const ofertasByProducto = useMemo(() => {
    const map = new Map();
    ofertas.forEach(oferta => {
      if (oferta.id_producto) {
        map.set(oferta.id_producto, oferta);
      }
    });
    return map;
  }, [ofertas]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        keyExtractor={(item, index) => `store-${String(item.id_producto ?? index)}`}
        renderItem={({ item }) => {
          // Imagen
          let uri = item.url_imagen || '';
          if (uri && !uri.startsWith('http')) {
            uri = uri.startsWith('/') ? `${API_URL}${uri}` : `${API_URL}/${uri}`;
          }
          if (/drive\.google\.com\/file\/d\//.test(uri)) {
            const match = uri.match(/\/file\/d\/([^/]+)/);
            const fileId = match && match[1];
            if (fileId) uri = `https://drive.google.com/uc?export=view&id=${fileId}`;
          }
          if (uri) uri = encodeURI(uri);

          // Buscar oferta para este producto
          const oferta = ofertasByProducto.get(item.id_producto);
          const precioBase = parseFloat(item.precio_unitario);
          const pct = oferta ? parseFloat(oferta.descuento_porcentaje) : 0;

          // Validar vigencia
          let vigente = true;
          if (oferta?.fecha_inicio && oferta?.fecha_fin) {
            const hoy = new Date();
            //vigente = new Date(oferta.fecha_inicio) <= hoy && hoy <= new Date(oferta.fecha_fin);
          }

          const tieneOferta = oferta && vigente && pct > 0;
          const precioDescuento = tieneOferta
            ? (precioBase * (1 - pct / 100)).toFixed(2)
            : null;

          return (
            <View style={[styles.card, tieneOferta ? styles.cardOferta : null]}>
              {uri ? <Image source={{ uri }} style={styles.image} /> : null}

              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.name}>{item.nombre}</Text>
                  {tieneOferta && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>-{pct}%</Text>
                    </View>
                  )}
                </View>

                {/* Precios */}
                {!tieneOferta ? (
                  <Text style={styles.price}>${precioBase.toFixed(2)}</Text>
                ) : (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceOld}>${precioBase.toFixed(2)}</Text>
                    <Text style={styles.priceNew}>${precioDescuento}</Text>
                  </View>
                )}

                {/* Descripción de oferta */}
                {tieneOferta && (
                  <Text style={styles.offerDesc} numberOfLines={2}>
                    {oferta.descripcion || 'Oferta disponible'}
                  </Text>
                )}
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
  card: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardOferta: {
    borderColor: '#FF6F61',
    backgroundColor: '#FFF7F6',
  },
  image: { width: 80, height: 80, marginRight: 12, borderRadius: 8 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '700', fontSize: 16, flexShrink: 1 },
  price: { color: '#1976D2', marginTop: 6, fontWeight: '600', fontSize: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  priceOld: { color: '#888', textDecorationLine: 'line-through', marginRight: 8, fontSize: 14 },
  priceNew: { color: '#D32F2F', fontWeight: '700', fontSize: 16 },
  badge: {
    backgroundColor: '#FF6F61',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  offerDesc: { color: '#555', marginTop: 4, fontSize: 12 },
});
