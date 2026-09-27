import { View, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function MainMenuScreen() {
  const router = useRouter();

  const handlePlayGame = () => {
    const message = 'Usap (Swipe) ke atas, bawah, kiri, atau kanan untuk menggerakkan katak. Hindari kendaraan di jalan raya dan gunakan batang kayu untuk menyeberangi sungai. Jangan sampai waktu habis!';
    
    if (Platform.OS === 'web') {
      const confirm = window.confirm(message);
      if (confirm) router.push('/game' as any);
    } else {
      Alert.alert(
        'Cara Bermain',
        message,
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'OK', onPress: () => router.push('/game' as any) },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Froggy Crosser</Text>
      <Text style={styles.subtitle}>Selamat datang di Main Menu!</Text>
      <View style={styles.buttonContainer}>
        <Button title="Play Game" onPress={handlePlayGame} color="#2e7d32" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '60%',
  },
});
