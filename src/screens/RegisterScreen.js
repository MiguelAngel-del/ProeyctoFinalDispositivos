import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { apiFetch } from '../services/api';
import { AppContext } from '../context/AppContext';

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AppContext);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono, setTelefono] = useState('');
  const [calle, setCalle] = useState('');
  const [colonia, setColonia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [idDepartamento, setIdDepartamento] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!nombre || !correo || !contrasena) {
      Alert.alert('Error', 'Completa nombre, correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      const body = { nombre, correo, contrasena, telefono, id_rol: 2 };
      const res = await apiFetch('/usuario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(res.data?.message || `Error ${res.status}`);
      const user = res.data;

      // If address data provided, create direccion (two-step like web)
      if (calle || colonia || ciudad || idDepartamento) {
        try {
          const dirBody = { calle: calle || '', colonia: colonia || '', ciudad: ciudad || '', estado: true, id_departamento: idDepartamento ? Number(idDepartamento) : 0, id_usuario: user.id_usuario || user.id };
          const dirRes = await apiFetch('/direcciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dirBody) });
          if (!dirRes.ok) console.warn('No se pudo crear dirección', dirRes.data);
        } catch (err) { console.warn('Crear direccion', err); }
      }

      // Auto-login after successful registration
      await login(correo, contrasena);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Regístrate como cliente</Text>

        <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
        <TextInput placeholder="Correo" value={correo} onChangeText={setCorreo} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
        <TextInput placeholder="Contraseña" value={contrasena} onChangeText={setContrasena} style={styles.input} secureTextEntry />
        <TextInput placeholder="Teléfono (opcional)" value={telefono} onChangeText={setTelefono} style={styles.input} keyboardType="phone-pad" />

        <Text style={styles.section}>Dirección (opcional)</Text>
        <TextInput placeholder="Calle" value={calle} onChangeText={setCalle} style={styles.input} />
        <TextInput placeholder="Colonia" value={colonia} onChangeText={setColonia} style={styles.input} />
        <TextInput placeholder="Ciudad" value={ciudad} onChangeText={setCiudad} style={styles.input} />
        <TextInput placeholder="ID Departamento" value={idDepartamento} onChangeText={setIdDepartamento} style={styles.input} keyboardType="numeric" />

        <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: '#1976D2' }}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f9fc', justifyContent: 'center' },
  container: { marginHorizontal: 24, backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  subtitle: { color: '#6b7280', marginBottom: 14, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#eef2f6', padding: 12, borderRadius: 10, marginBottom: 12, backgroundColor: '#fbfdff' },
  button: { backgroundColor: '#ff7a18', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
