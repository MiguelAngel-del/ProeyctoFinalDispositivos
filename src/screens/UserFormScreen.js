import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { apiFetch } from '../services/api';
import { colors } from '../theme';

export default function UserFormScreen({ route, navigation }) {
  const editingId = route?.params?.id ?? null;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', direccion: '', contrasena: '', id_rol: '2' });

  useEffect(() => { if (editingId) load(); }, [editingId]);

  async function load() {
    setLoading(true);
    const res = await apiFetch(`/usuario/${editingId}`);
    if (res.ok) {
      const u = res.data || {};
      setForm({ nombre: u.nombre || '', correo: u.correo || '', telefono: u.telefono || '', direccion: u.direccion || '', contrasena: '', id_rol: String(u.rol?.id_rol ?? 2) });
    } else {
      Alert.alert('Error', res.data?.message || `No se pudo cargar usuario ${editingId}`);
    }
    setLoading(false);
  }

  async function submit() {
    try {
      setLoading(true);
      // Basic validation
      if (!form.nombre || !form.correo) {
        Alert.alert('Error', 'Nombre y correo son obligatorios');
        setLoading(false);
        return;
      }
      if (!editingId) {
        if (!form.contrasena || form.contrasena.length < 6) {
          Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }
        if (!form.telefono) {
          Alert.alert('Error', 'El teléfono es obligatorio');
          setLoading(false);
          return;
        }
      }

      const body = { nombre: form.nombre, correo: form.correo, telefono: form.telefono, direccion: form.direccion || undefined, contrasena: form.contrasena || undefined, id_rol: Number(form.id_rol) };
      const url = editingId ? `/usuario/${editingId}` : '/usuario';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(res.data?.message || `Error ${res.status}`);
      Alert.alert('OK', editingId ? 'Usuario actualizado' : 'Usuario creado');
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message || 'No se pudo guardar'); }
    finally { setLoading(false); }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary.main} />;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{editingId ? 'Editar usuario' : 'Crear usuario'}</Text>
      <TextInput placeholder="Nombre" placeholderTextColor={colors.muted} value={form.nombre} onChangeText={(t) => setForm({ ...form, nombre: t })} style={styles.input} />
      <TextInput placeholder="Correo" placeholderTextColor={colors.muted} value={form.correo} onChangeText={(t) => setForm({ ...form, correo: t })} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Teléfono" placeholderTextColor={colors.muted} value={form.telefono} onChangeText={(t) => setForm({ ...form, telefono: t })} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Dirección (opcional)" placeholderTextColor={colors.muted} value={form.direccion} onChangeText={(t) => setForm({ ...form, direccion: t })} style={styles.input} />
      <TextInput placeholder="Contraseña" placeholderTextColor={colors.muted} value={form.contrasena} onChangeText={(t) => setForm({ ...form, contrasena: t })} style={styles.input} secureTextEntry />

      <Text style={{ marginBottom: 6, color: colors.text }}>Rol</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => setForm({ ...form, id_rol: '2' })} style={[styles.roleBtn, form.id_rol === '2' ? styles.roleActive : null]}>
          <Text style={form.id_rol === '2' ? { color: '#fff' } : null}>Clientes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setForm({ ...form, id_rol: '1' })} style={[styles.roleBtn, form.id_rol === '1' ? styles.roleActive : null]}>
          <Text style={form.id_rol === '1' ? { color: '#fff' } : null}>Administrador</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={submit} style={[styles.btn, styles.btnPrimary]}>
        <Text style={[styles.btnText, { color: colors.primary.contrastText }]}>{editingId ? 'Actualizar' : 'Crear'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: colors.background },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, padding: 10, marginBottom: 12, borderRadius: colors.radius, backgroundColor: colors.card, color: colors.text },
  roleBtn: { padding: 8, borderRadius: colors.radius, backgroundColor: colors.grey[100], marginRight: 8 },
  roleActive: { backgroundColor: colors.primary.main },
  btn: { backgroundColor: colors.grey[100], padding: 12, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.primary.main },
  btnText: { color: colors.text, fontWeight: '600' },
});
