import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getUsers, type UserDto } from '@/services/api';

export default function TabOneScreen() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then((data) => setUsers(data))
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Error cargando usuarios';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={users}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={<Text>No se encontraron usuarios</Text>}
      renderItem={({ item }) => (
        <View style={styles.card} lightColor="#f8fafc" darkColor="#111827">
          <Text style={styles.name}>{item.name || item.nombre || 'Usuario sin nombre'}</Text>
          <Text>{item.email || 'Sin email'}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  error: {
    color: '#b91c1c',
    textAlign: 'center',
  },
});
