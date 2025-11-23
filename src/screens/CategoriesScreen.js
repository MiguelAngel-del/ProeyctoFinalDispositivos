import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { apiFetch } from '../services/api';
import { colors } from '../theme';

export default function CategoriesScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchAll());
    return unsubscribe;
  }, [navigation]);

  async function fetchAll() {
    const res = await apiFetch('/categorias');
    if (res.ok) setItems(res.data || []);
    try {
      const keys = (res.data || []).map((item, idx) => String(item.id_categoria ?? item.id ?? item._id ?? idx));
      const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
      if (dup.length) console.warn('CategoriesScreen duplicate keys:', Array.from(new Set(dup)).slice(0,10));
    } catch (e) { console.warn('CategoriesScreen key check failed', e); }
  }

  async function remove(id) {
    try {
      const res = await apiFetch(`/categorias/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      fetchAll();
    } catch (e) { Alert.alert('Error', e.message); }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Categorías</Text>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('CategoryForm')}>
          <Text style={[styles.btnText, { color: colors.primary.contrastText }]}>Crear categoría</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `cat-${String(item.id_categoria ?? item.id ?? item._id ?? index)}`}
        renderItem={({ item }) => {
          const id = item.id_categoria ?? item.id ?? item._id;
          return (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.nombre}</Text>
                <Text style={styles.itemDesc}>{item.descripcion}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('CategoryForm', { id })} style={[styles.smallBtn, styles.btnSecondary]}>
                <Text style={[styles.smallBtnText, { color: colors.secondary.contrastText }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(id)} style={[styles.smallBtn, styles.btnDanger]}>
                <Text style={[styles.smallBtnText, { color: colors.error.contrastText || '#fff' }]}>Eliminar</Text>
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
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  
  form: { marginBottom: 12, backgroundColor: colors.card, padding: 10, borderRadius: colors.radius },
  input: { borderWidth: 1, borderColor: colors.border, padding: 8, marginBottom: 8, borderRadius: 8, backgroundColor: colors.card },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.card, marginBottom: 8, borderRadius: colors.radius },
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
