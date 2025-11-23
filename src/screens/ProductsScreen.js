import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { apiFetch, fullUrl } from '../services/api';
import { AppContext } from '../context/AppContext';
import { colors } from '../theme';

export default function ProductsScreen({ navigation }) {
  const { token } = useContext(AppContext);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio_unitario: '', id_categoria: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchList(); }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { fetchList(); });
    return unsubscribe;
  }, [navigation]);

  async function fetchList() {
    setLoading(true);
    const res = await apiFetch('/productos');
    if (res.ok) setProductos(res.data || []);
    try {
      const keys = (res.data || []).map((item, idx) => String(item.id_producto ?? item.id ?? item._id ?? idx));
      const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
      if (dup.length) console.warn('ProductsScreen duplicate keys:', Array.from(new Set(dup)).slice(0,10));
    } catch (e) { console.warn('ProductsScreen key check failed', e); }
    setLoading(false);
  }

  async function submit() {
    try {
      const body = { ...form, precio_unitario: parseFloat(form.precio_unitario || 0), id_categoria: form.id_categoria ? Number(form.id_categoria) : undefined };
      let res;
      if (editingId) {
        res = await apiFetch(`/productos/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        res = await apiFetch('/productos', { method: 'POST', body: JSON.stringify(body) });
      }
      if (!res.ok) {
        console.warn('Products submit error', res);
        throw new Error(res.data?.message || `Error ${res.status}`);
      }
      setForm({ nombre: '', descripcion: '', precio_unitario: '', id_categoria: '' });
      setEditingId(null);
      fetchList();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo guardar');
    }
  }

  async function remove(id) {
    try {
      const res = await apiFetch(`/productos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(res.data?.message || 'Error');
      fetchList();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo eliminar');
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary.main} />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Productos</Text>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('ProductForm', { id: null })}>
          <Text style={[styles.btnText, { color: colors.primary.contrastText }]}>Crear producto</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={productos}
        keyExtractor={(item, index) => `prod-${String(item.id_producto ?? item.id ?? item._id ?? index)}`}
        renderItem={({ item }) => {
          const id = item.id_producto ?? item.id ?? item._id;
          return (
            <View style={styles.item}>
              <View style={{ width: 64, marginRight: 12 }}>
                {item.url_imagen ? (
                  <Image source={{ uri: fullUrl(item.url_imagen) }} style={styles.thumb} />
                ) : (
                  <View style={styles.noThumb}><Text style={{ color: colors.grey[500] }}>No Img</Text></View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.nombre}</Text>
                <Text style={styles.itemDesc}>${item.precio_unitario}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ProductForm', { id })} style={[styles.smallBtn, styles.btnSecondary]}>
                <Text style={[styles.smallBtnText, { color: colors.secondary.contrastText }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(id)} style={[styles.smallBtn, styles.btnDanger]}>
                <Text style={[styles.smallBtnText, { color: '#fff' }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  form: { marginBottom: 12, backgroundColor: colors.card, padding: 10, borderRadius: colors.radius },
  input: { borderWidth: 1, borderColor: colors.border, padding: 8, marginBottom: 8, borderRadius: 8, backgroundColor: colors.card },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.card, marginBottom: 8, borderRadius: colors.radius },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: colors.grey[200] },
  noThumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: colors.grey[50], alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontWeight: '700', color: colors.text },
  itemDesc: { color: colors.muted },
  btn: { padding: 8, borderRadius: 8, backgroundColor: colors.grey[100], marginLeft: 8 },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginLeft: 8 },
  btnPrimary: { backgroundColor: colors.primary.main },
  btnSecondary: { backgroundColor: colors.secondary.main },
  btnDanger: { backgroundColor: colors.error.main },
  btnText: { color: colors.text, fontWeight: '600' },
  smallBtnText: { color: colors.text, fontWeight: '600', fontSize: 13 },
});
