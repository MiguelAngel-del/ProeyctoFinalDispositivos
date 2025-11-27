
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { apiFetch } from '../services/api';
import { Ionicons } from '@expo/vector-icons'; // Si usas Expo, si no: react-native-vector-icons/Ionicons

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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1976D2" />;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial de acciones - Actividades</Text>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => `log-${String(item.id ?? item.id_log ?? index)}`}
        renderItem={({ item }) => {
          const iconName = item.accion?.toLowerCase().includes('crear')
            ? 'add-circle-outline'
            : item.accion?.toLowerCase().includes('eliminar')
            ? 'trash-outline'
            : 'document-text-outline';

          return (
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={28} color="#1976D2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.accion || 'Acción desconocida'}</Text>
                <Text style={styles.meta}>
                  {formatDate(item.fecha)} {item.usuarioId ? ` • Usuario ${item.usuarioId}` : ''}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F6FA' },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#333' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: { fontWeight: '700', fontSize: 16, color: '#222' },
  meta: { color: '#666', marginTop: 4, fontSize: 13 },
});
