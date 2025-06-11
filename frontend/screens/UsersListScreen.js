import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { fetchUsers, getCurrentUser } from '../services/api';
import { useChats } from '../ChatContext';

export default function UsersListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addChat } = useChats();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const meData = await getCurrentUser();
      setMe(meData);
      const all = await fetchUsers();
      setUsers(all.filter((u) => u.id !== meData.id));
    } catch (err) {
      console.error('UsersList loadUsers error:', err.response?.data || err.message);
      Alert.alert('Błąd', 'Nie udało się pobrać użytkowników');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        addChat(item);
        navigation.navigate('Chat', { other: item });
      }}
    >
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text>Brak innych użytkowników.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  item: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
  },
  username: { fontSize: 18, color: '#333' },
  list: { paddingBottom: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
