import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('username');
      if (savedUser) {
        // Jika sudah login, lompat ke layar utama
        router.replace('/(drawer)/main' as any);
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (username.trim() === '') {
      if (Platform.OS === 'web') window.alert('Username tidak boleh kosong!');
      else Alert.alert('Error', 'Username tidak boleh kosong!');
      return;
    }
    try {
      await AsyncStorage.setItem('username', username);
      router.replace('/(drawer)/main' as any);
    } catch (e) {
      if (Platform.OS === 'web') window.alert('Gagal menyimpan username');
      else Alert.alert('Error', 'Gagal menyimpan username');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Memuat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Froggy Crosser</Text>
      <Text style={styles.subtitle}>Masukkan Username untuk Bermain</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2e7d32', // Warna hijau katak
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});
