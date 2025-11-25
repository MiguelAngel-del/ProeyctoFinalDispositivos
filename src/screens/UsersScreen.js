
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { apiFetch } from '../services/api';
import { colors } from '../theme';

export default function UsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState(null); // null = todos

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
    } catch (e) {
      console.warn('fetch users', e);
    }
    setLoading(false);
  }

  async function remove(id) {
    try {
      const res = await apiFetch(`/usuario/eliminar/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error(res.data?.message || 'Error');
      fetchList();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo desactivar');
    }
  }

function getBackgroundColor(item) {
  if (item?.rol?.nombre !== 'Cliente') {
    return colors.card; // Fondo normal para administradores
  }
  switch (item?.estado_cliente_label) {
    case 'Posible':
      return '#FFA500'; // Naranja
    case 'Fidelizado':
      return '#4ca8afff'; // Verde agradable
    default:
      return '#D3D3D3'; // Gris
  }
}


  // Derivar roles únicos desde los usuarios
  const roles = useMemo(() => {
    const map = new Map();
    for (const u of users) {
      const r = u?.rol;
      if (r && r.id_rol != null) {
        // clave por id_rol para evitar duplicados
        if (!map.has(r.id_rol)) map.set(r.id_rol, { id_rol: r.id_rol, nombre: r.nombre });
      }
    }
    // Agregar opción "Todos" al inicio
    return [{ id_rol: null, nombre: 'Todos' }, ...Array.from(map.values())];
  }, [users]);

  // Filtrar según selectedRoleId (client-side)
  const filteredUsers = useMemo(() => {
    if (!selectedRoleId && selectedRoleId !== 0) return users;
    return users.filter(u => u?.rol?.id_rol === selectedRoleId);
  }, [users, selectedRoleId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary.main} />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Usuarios</Text>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => navigation.navigate('UserForm', { id: null })}
        >
          <Text style={[styles.btnText, { color: colors.primary.contrastText }]}>Crear usuario</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro por rol */}
      <View style={styles.filterRow}>
        {roles.map((role) => {
          const isActive = selectedRoleId === role.id_rol || (role.id_rol === null && selectedRoleId === null);
          return (
            <TouchableOpacity
              key={`role-${String(role.id_rol)}`}
              onPress={() => setSelectedRoleId(role.id_rol)}
              style={[
                styles.filterBtn,
                isActive ? styles.btnPrimary : { backgroundColor: colors.grey[100] }
              ]}
            >
              <Text style={[styles.btnText, { color: isActive ? colors.primary.contrastText : colors.text }]}>
                {role.nombre ?? `Rol ${role.id_rol}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>



<FlatList
  data={filteredUsers}
  keyExtractor={(item, index) => `user-${String(item.id_usuario ?? index)}`}
  renderItem={({ item }) => {
    const id = item.id_usuario ?? item.id ?? item._id;
    const isAdmin = item?.rol?.nombre === 'Administrador';
    return (
      <View style={[styles.item, { backgroundColor: getBackgroundColor(item) }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.nombre}</Text>
          <Text style={styles.itemDesc}>{item.correo}</Text>

          {/* Mostrar rol */}
          {item?.rol?.nombre && (
            <Text style={[styles.itemDesc, { marginTop: 4 }]}>
              Rol: {item.rol.nombre}
            </Text>
          )}

          {/* Mostrar estado cliente SOLO si NO es Administrador */}
          {!isAdmin && item?.estado_cliente_label && (
            <Text style={[styles.itemDesc, { marginTop: 2 }]}>
              Estado cliente: {item.estado_cliente_label}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('UserForm', { id })}
          style={[styles.smallBtn, styles.btnSecondary]}
        >
          <Text style={[styles.smallBtnText, { color: colors.secondary.contrastText }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => remove(id)}
          style={[styles.smallBtn, styles.btnDanger]}
        >
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
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
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
  emptyWrap: { paddingVertical: 24, alignItems: 'center' },
});
