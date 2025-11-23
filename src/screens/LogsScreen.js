import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { apiFetch } from '../services/api';

export default function LogsScreen() {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const res = await apiFetch('/logs');
				if (res.ok) setLogs(res.data || []);
			} catch (e) {
				console.warn('LogsScreen fetch error', e);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

	return (
		<View style={styles.container}>
			<FlatList
				data={logs}
				keyExtractor={(item, index) => `log-${String(item.id ?? item.id_log ?? item._id ?? index)}`}
				renderItem={({ item }) => (
					<View style={styles.item}>
						<Text style={styles.title}>{item.accion || 'Acción'}</Text>
						<Text style={styles.meta}>{item.fecha || ''} {item.usuarioId ? ` • Usuario ${item.usuarioId}` : ''}</Text>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, item: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 }, title: { fontWeight: '700' }, meta: { color: '#666', marginTop: 6 } });

