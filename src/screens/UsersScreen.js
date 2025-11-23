import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { apiFetch } from '../services/api';
import { colors } from '../theme';

export default function UsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchList(); }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchList());
    return unsubscribe;
  }, [navigation]);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await apiFetch('/usuario');
      if (res.ok) setUsers(res.data || []);
    } catch (e) { console.warn('fetch users', e); }
    setLoading(false);
  }

  async function remove(id) {
    try {
      const res = await apiFetch(`/usuario/eliminar/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error(res.data?.message || 'Error');
      fetchList();
    } catch (e) { Alert.alert('Error', e.message || 'No se pudo desactivar'); }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary.main} />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Usuarios</Text>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('UserForm', { id: null })}>
          <Text style={[styles.btnText, { color: colors.primary.contrastText }]}>Crear usuario</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item, index) => `user-${String(item.id_usuario ?? item.id ?? item._id ?? index)}`}
        renderItem={({ item }) => {
          const id = item.id_usuario ?? item.id ?? item._id;
          return (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.nombre}</Text>
                <Text style={styles.itemDesc}>{item.correo}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('UserForm', { id })} style={[styles.smallBtn, styles.btnSecondary]}>
                <Text style={[styles.smallBtnText, { color: colors.secondary.contrastText }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(id)} style={[styles.smallBtn, styles.btnDanger]}>
                <Text style={[styles.smallBtnText, { color: '#fff' }]}>Desactivar</Text>
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
