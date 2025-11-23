import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Platform, Modal, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch, postFormData, fullUrl } from '../services/api';
import { colors } from '../theme';

export default function ProductFormScreen({ route, navigation }) {
  const editingId = route?.params?.id ?? null;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio_unitario: '', stock_minimo: '', id_categoria: '', url_imagen: '' });
  const [localImage, setLocalImage] = useState(null); // { uri, name, type }
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    if (editingId) load();
    fetchCategories();
  }, [editingId]);

  async function fetchCategories() {
    try {
      const res = await apiFetch('/categorias');
      if (res.ok) setCategories(res.data || []);
    } catch (e) { console.warn('fetchCategories', e); }
  }

  async function load() {
    setLoading(true);
    const res = await apiFetch(`/productos/${editingId}`);
    if (res.ok) {
      const p = res.data || {};
      setForm({ nombre: p.nombre || '', descripcion: p.descripcion || '', precio_unitario: String(p.precio_unitario ?? ''), stock_minimo: String(p.stock_minimo ?? ''), id_categoria: String(p.id_categoria ?? p.id_categoria ?? ''), url_imagen: p.url_imagen || '' });
      setLocalImage(null);
    } else {
      Alert.alert('Error', res.data?.message || `No se pudo cargar producto ${editingId}`);
    }
    setLoading(false);
  }

  async function pickImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar imágenes.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
      if (result.cancelled || result.canceled) return;
      // Expo SDK 49+ returns result.assets
      const asset = result.assets ? result.assets[0] : result;
      const uri = asset.uri || asset.path;
      let name = uri.split('/').pop();
      const extMatch = name && name.match(/\.([0-9a-zA-Z]+)$/);
      const ext = extMatch ? extMatch[1] : 'jpg';
      const type = asset.type ? `${asset.type}/${ext}` : `image/${ext}`;
      setLocalImage({ uri, name, type });
    } catch (e) {
      console.warn('pickImage error', e);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  }

  function removeLocalImage() {
    setLocalImage(null);
    // keep form.url_imagen as-is (existing remote image) unless you want to clear it
  }

  async function submit() {
    try {
      setLoading(true);
      // If user picked a local image, send multipart/form-data
      if (localImage) {
        const formData = new FormData();
        formData.append('nombre', form.nombre);
        formData.append('descripcion', form.descripcion);
        formData.append('precio_unitario', String(parseFloat(form.precio_unitario || 0)));
        if (form.id_categoria) formData.append('id_categoria', String(Number(form.id_categoria)));
        // Append image file
        const file = {
          uri: Platform.OS === 'android' ? localImage.uri : localImage.uri.replace('file://', ''),
          name: localImage.name || `photo.${localImage.uri.split('.').pop()}`,
          type: localImage.type || 'image/jpeg',
        };
        formData.append('imagen', file);
        if (form.stock_minimo) formData.append('stock_minimo', String(parseInt(form.stock_minimo || '0')));
        const path = editingId ? `/productos/${editingId}` : '/productos';
        const method = editingId ? 'PUT' : 'POST';
        const res = await postFormData(path, formData, method);
        if (!res.ok) throw new Error(res.data?.message || `Error ${res.status}`);
        Alert.alert('OK', editingId ? 'Producto actualizado' : 'Producto creado');
        navigation.goBack();
        return;
      }

      // No local image selected: send JSON as before (may include url_imagen)
      const body = { nombre: form.nombre, descripcion: form.descripcion, precio_unitario: parseFloat(form.precio_unitario || 0), stock_minimo: form.stock_minimo ? parseInt(form.stock_minimo) : 0, id_categoria: form.id_categoria ? Number(form.id_categoria) : undefined, url_imagen: form.url_imagen || undefined };
      let res;
      if (editingId) {
        res = await apiFetch(`/productos/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        res = await apiFetch('/productos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      if (!res.ok) {
        console.warn('ProductForm submit error', res);
        throw new Error(res.data?.message || `Error ${res.status}`);
      }
      Alert.alert('OK', editingId ? 'Producto actualizado' : 'Producto creado');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo guardar');
    } finally { setLoading(false); }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary.main} />;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{editingId ? 'Editar producto' : 'Crear producto'}</Text>
      <TextInput placeholder="Nombre" placeholderTextColor={colors.muted} value={form.nombre} onChangeText={(t) => setForm({ ...form, nombre: t })} style={styles.input} />
      <TextInput placeholder="Descripción" placeholderTextColor={colors.muted} value={form.descripcion} onChangeText={(t) => setForm({ ...form, descripcion: t })} style={styles.input} multiline />
      <TextInput placeholder="Precio" placeholderTextColor={colors.muted} value={form.precio_unitario} onChangeText={(t) => setForm({ ...form, precio_unitario: t })} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Stock mínimo" placeholderTextColor={colors.muted} value={form.stock_minimo} onChangeText={(t) => setForm({ ...form, stock_minimo: t })} style={styles.input} keyboardType="numeric" />
      {/* Category combobox (opens searchable modal) */}
      <Text style={{ marginBottom: 6, color: colors.text }}>Categoría</Text>
      <TouchableOpacity onPress={() => { setCategorySearch(''); setModalVisible(true); }} style={styles.categorySelector}>
        <Text>{(categories.find(c => String(c.id_categoria) === String(form.id_categoria)) || {}).nombre || 'Seleccionar categoría'}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors.text }}>Seleccionar categoría</Text>
            <TextInput placeholder="Buscar..." placeholderTextColor={colors.muted} value={categorySearch} onChangeText={setCategorySearch} style={styles.input} />
            <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
              {categories.filter(c => (c.nombre || '').toLowerCase().includes(categorySearch.toLowerCase())).map((c) => (
                <TouchableOpacity key={String(c.id_categoria)} onPress={() => { setForm({ ...form, id_categoria: String(c.id_categoria) }); setModalVisible(false); }} style={styles.categoryItem}>
                  <Text>{c.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.btn, styles.btnSecondary]}>
                <Text style={[styles.btnText, { color: colors.secondary.contrastText }]}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {(localImage?.uri || form.url_imagen) ? (
        <Image source={{ uri: localImage?.uri || fullUrl(form.url_imagen) }} style={styles.preview} />
      ) : (
        <View style={styles.noPreview}><Text style={{ color: colors.muted }}>Sin imagen seleccionada</Text></View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity onPress={pickImage} style={[styles.btn, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.btnText}>Seleccionar imagen</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={removeLocalImage} style={[styles.btn, styles.btnDanger, { width: 120 }]}>
          <Text style={[styles.btnText, { color: '#fff' }]}>Quitar</Text>
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
  preview: { width: '100%', height: 220, borderRadius: colors.radius, marginBottom: 12, backgroundColor: colors.grey[200] },
  noPreview: { width: '100%', height: 220, borderRadius: colors.radius, marginBottom: 12, backgroundColor: colors.grey[50], alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  categorySelector: { borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: colors.radius, marginBottom: 8, backgroundColor: colors.card },
  categoryList: { maxHeight: 180, borderWidth: 1, borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card, marginBottom: 12 },
  categoryItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.grey[50] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.card, borderRadius: colors.radius, padding: 12, maxHeight: '80%' },
  btn: { backgroundColor: colors.grey[100], padding: 12, borderRadius: colors.radius, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.primary.main },
  btnSecondary: { backgroundColor: colors.secondary.main },
  btnDanger: { backgroundColor: colors.error.main },
  btnText: { color: colors.text, fontWeight: '600' },
});
