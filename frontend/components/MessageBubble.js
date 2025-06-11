import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ text, isMine }) {
  return (
    <View style={[styles.bubble, isMine ? styles.right : styles.left]}>
      <Text style={[styles.text, isMine ? styles.textRight : styles.textLeft]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    marginVertical: 4,
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
  },
  left: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5e5',
  },
  right: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  text: {
    fontSize: 16,
  },
  textLeft: {
    color: '#000',
  },
  textRight: {
    color: '#fff',
  },
});
