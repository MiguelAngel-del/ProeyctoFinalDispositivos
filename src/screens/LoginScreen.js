import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
	const { login } = useContext(AppContext);
	const [correo, setCorreo] = useState('');
	const [contrasena, setContrasena] = useState('');
	const [loading, setLoading] = useState(false);

	async function onSubmit() {
		setLoading(true);
		await login(correo, contrasena);
		setLoading(false);
	}

	return (
		<View style={styles.screen}>
			<View style={styles.container}>
				<Image source={require('../../assets/logoEC.png')} style={styles.logo} resizeMode="contain" />
				<Text style={styles.title}>Bienvenido</Text>
				<Text style={styles.subtitle}>Inicia sesión para continuar en la tienda</Text>

				<View style={styles.form}>
					<TextInput
						placeholder="Correo"
						value={correo}
						onChangeText={setCorreo}
						style={styles.input}
						autoCapitalize="none"
						keyboardType="email-address"
						placeholderTextColor="#9aa4b2"
					/>
					<TextInput
						placeholder="Contraseña"
						value={contrasena}
						onChangeText={setContrasena}
						style={styles.input}
						secureTextEntry
						placeholderTextColor="#9aa4b2"
					/>

					<TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
						{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
					</TouchableOpacity>
				</View>

				<TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 12 }}>
					<Text style={[styles.footer, { color: '#1976D2' }]}>¿No tienes cuenta? Crear una</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: '#f7f9fc', justifyContent: 'center' },
	container: { marginHorizontal: 24, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10 },
	logo: { width: 120, height: 120, marginBottom: 6 },
	title: { fontSize: 22, fontWeight: '800', color: '#0b1a2b', marginTop: 6 },
	subtitle: { color: '#6b7280', marginBottom: 16, textAlign: 'center' },
	form: { width: '100%' },
	input: { borderWidth: 1, borderColor: '#eef2f6', padding: 12, borderRadius: 10, marginBottom: 12, backgroundColor: '#fbfdff' },
	button: { backgroundColor: '#ff7a18', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
	buttonText: { color: '#fff', fontWeight: '700' },
	footer: { marginTop: 12, color: '#9aa4b2', fontSize: 12 }
});


