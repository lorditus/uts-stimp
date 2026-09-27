import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

export default function HighScoreScreen() {
  const [highscores, setHighscores] = useState<{name: string, score: number}[]>([]);

  // useFocusEffect memastikan data diperbarui setiap kali layar ini dibuka
  useFocusEffect(
    useCallback(() => {
      const fetchScores = async () => {
        try {
          const savedScoresStr = await AsyncStorage.getItem('highscores');
          if (savedScoresStr) {
            setHighscores(JSON.parse(savedScoresStr));
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchScores();
    }, [])
  );

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    // Tentukan warna piala (Gold, Silver, Bronze)
    let rankColor = '#FFD700'; // Gold
    if (index === 1) rankColor = '#C0C0C0'; // Silver
    if (index === 2) rankColor = '#CD7F32'; // Bronze

    return (
      <View style={styles.card}>
        <View style={[styles.rankCircle, { backgroundColor: rankColor }]}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.scoreText}>Katak Selamat: {item.score}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top 3 High Scores</Text>
      
      {highscores.length === 0 ? (
        <Text style={styles.emptyText}>Belum ada skor yang tersimpan.</Text>
      ) : (
        <FlatList
          data={highscores}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2e7d32',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2, // Shadow untuk Android
    shadowColor: '#000', // Shadow untuk iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  rankCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  }
});
