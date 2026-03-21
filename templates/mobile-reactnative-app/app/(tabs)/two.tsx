import { useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { logout } from '@/services/auth';

export default function TabTwoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await logout();
    setLoading(false);
    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sesion</Text>
      <Text style={styles.subtitle}>Usa este boton para limpiar el token local.</Text>
      <Button title={loading ? 'Cerrando...' : 'Cerrar sesion'} onPress={handleLogout} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    marginVertical: 10,
  },
});
