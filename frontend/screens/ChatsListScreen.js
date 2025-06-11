import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useChats } from '../ChatContext';

export default function ChatsListScreen({ navigation }) {
  const { chats } = useChats();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { other: item })}
    >
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <Text style={styles.emptyText}>Brak aktywnych czatów.</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  list: { paddingBottom: 16 },
  chatItem: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#f1f1f1',
    borderRadius: 16,
  },
  username: { fontSize: 18, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 20, color: 'gray' },
});
