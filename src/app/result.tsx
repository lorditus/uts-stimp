import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function ResultScreen() {
  const router = useRouter();
  const { score } = useLocalSearchParams();
  const finalScore = parseInt(score as string) || 0;
  
  const [username, setUsername] = useState('Player');
  
  // Tentukan Gelar
  let title = "Unlucky Amphibian";
  if (finalScore >= 5) title = "Apex Amphibian";
  else if (finalScore === 4) title = "Highway Navigator";
  else if (finalScore === 3) title = "Agile Hopper";
  else if (finalScore === 2) title = "Pond Explorer";
  else if (finalScore === 1) title = "Daring Tadpole";
    else if (finalScore === 0) title = "Unlucky Amphibian";


  useEffect(() => {
    const saveScore = async () => {
      try {
        const user = await AsyncStorage.getItem('username');
        if (user) setUsername(user);
        
        // Simpan score jika lebih tinggi (opsional: simpan ke array JSON untuk top 3)
        const savedScoresStr = await AsyncStorage.getItem('highscores');
        let scores = savedScoresStr ? JSON.parse(savedScoresStr) : [];
        
        scores.push({ name: user || 'Player', score: finalScore });
        // Urutkan menurun dan ambil top 3
        scores.sort((a: any, b: any) => b.score - a.score);
        scores = scores.slice(0, 3);
        
        await AsyncStorage.setItem('highscores', JSON.stringify(scores));
      } catch (e) {
        console.error(e);
      }
    };
    saveScore();
  }, [finalScore]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Over, {username}!</Text>
      
      <View style={styles.card}>
        <Text style={styles.scoreTitle}>Jumlah Katak Selamat:</Text>
        <Text style={styles.scoreValue}>{finalScore}</Text>
        <Text style={styles.rankTitle}>Gelar Anda:</Text>
        <Text style={styles.rankValue}>"{title}"</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Play Again" onPress={() => router.replace('/game' as any)} color="#2e7d32" />
        <View style={{height: 15}} />
        <Button title="High Scores" onPress={() => router.replace('/(drawer)/highscore' as any)} color="#1565c0" />
        <View style={{height: 15}} />
        <Button title="Main Menu" onPress={() => router.replace('/(drawer)/main' as any)} color="#555" />
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
    elevation: 3,
  },
  scoreTitle: {
    fontSize: 18,
    color: '#666',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 10,
  },
  rankTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  rankValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff9800', // Warna oren
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '80%',
  }
});
