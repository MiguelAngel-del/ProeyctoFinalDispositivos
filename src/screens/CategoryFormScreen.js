import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { apiFetch } from '../services/api';
import { colors } from '../theme';

export default function CategoryFormScreen({ route, navigation }) {
  const editingId = route?.params?.id ?? null;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  useEffect(() => { if (editingId) load(); }, [editingId]);

  async function load() {
    setLoading(true);
    const res = await apiFetch(`/categorias/${editingId}`);
    if (res.ok) setForm({ nombre: res.data?.nombre || '', descripcion: res.data?.descripcion || '' });
    else Alert.alert('Error', res.data?.message || 'No se pudo cargar la categoría');
    setLoading(false);
  }

  async function submit() {
    try {
      setLoading(true);
      const body = { nombre: form.nombre, descripcion: form.descripcion };
      let res;
      if (editingId) res = await apiFetch(`/categorias/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      else res = await apiFetch('/categorias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(res.data?.message || `Error ${res.status}`);
      Alert.alert('OK', editingId ? 'Categoría actualizada' : 'Categoría creada');
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message || 'No se pudo guardar'); }
    finally { setLoading(false); }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary.main} />;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{editingId ? 'Editar categoría' : 'Crear categoría'}</Text>
      <TextInput placeholder="Nombre" placeholderTextColor={colors.muted} value={form.nombre} onChangeText={(t) => setForm({ ...form, nombre: t })} style={styles.input} />
      <TextInput placeholder="Descripción" placeholderTextColor={colors.muted} value={form.descripcion} onChangeText={(t) => setForm({ ...form, descripcion: t })} style={styles.input} multiline />
      <TouchableOpacity onPress={submit} style={[styles.btn, styles.btnPrimary]}>
        <Text style={[styles.btnText, { color: colors.primary.contrastText }]}>{editingId ? 'Actualizar' : 'Crear'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: colors.background },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, padding: 8, marginBottom: 12, borderRadius: colors.radius, backgroundColor: colors.card, color: colors.text },
  btn: { padding: 12, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.primary.main },
  btnText: { color: colors.text, fontWeight: '600' },
});
