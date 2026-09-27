import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

// Kustom komponen drawer manual agar tidak terjadi konflik import dengan expo-router
function CustomDrawerContent(props: any) {
  const [username, setUsername] = useState('Player');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem('username');
      if (user) setUsername(user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('username');
    router.replace('/' as any);
  };

  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hello, {username}!</Text>
      </View>
      <Pressable style={styles.menuItem} onPress={() => router.push('/(drawer)/main' as any)}>
        <Text style={styles.menuText}>Main Menu</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={() => router.push('/(drawer)/highscore' as any)}>
        <Text style={styles.menuText}>High Score</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={handleLogout}>
        <Text style={[styles.menuText, { color: 'red' }]}>Log Out</Text>
      </Pressable>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="main"
        options={{
          drawerLabel: 'Home',
          title: 'Main Menu',
        }}
      />
      <Drawer.Screen
        name="highscore"
        options={{
          drawerLabel: 'High Score',
          title: 'High Score',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#2e7d32',
    marginBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
