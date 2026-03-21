import { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { login } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setLoading(true);

    try {
      await login();
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesion';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bootcamp Mobile</Text>
      <Text style={styles.subtitle}>Inicia sesion con OIDC para acceder a la API</Text>
      {loading ? <ActivityIndicator size="large" /> : <Button title="Iniciar sesion" onPress={handleLogin} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
  error: {
    color: '#b91c1c',
    textAlign: 'center',
  },
});
