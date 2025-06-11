// ChatScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import MessageBubble from '../components/MessageBubble';
import { encryptText, decryptSignal } from '../utils/transmulti';
import { fetchConversation, sendMessage, getCurrentUser } from '../services/api';
import { useChats } from '../ChatContext';

export default function ChatScreen({ route, navigation }) {
  const { other } = route.params;         // Drugi użytkownik (ktoś, z kim rozmawiamy)
  const [me, setMe] = useState(null);      // Bieżący użytkownik (z API)
  const [msgs, setMsgs] = useState([]);    // Lista wiadomości do wyświetlenia
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const { addChat } = useChats();

  // --- 1) Pobranie bieżącego użytkownika (me) przy pierwszym renderowaniu ---
  useEffect(() => {
    const loadMe = async () => {
      try {
        const meData = await getCurrentUser();
        setMe(meData);
      } catch (err) {
        console.error('Nie udało się pobrać profilu:', err.response?.data || err.message);
      }
    };
    loadMe();
  }, []);

  // --- 2) Załadowanie i przetłumaczenie konwersacji ---
  const loadConversation = useCallback(async () => {
    if (!me) return;                      // Dopóki nie mamy me, nic nie róbemy
    setLoading(true);
    try {
      const conv = await fetchConversation(other.id);
      // Przykładowa struktura „conv” to lista obiektów:
      // { id, sender_id, receiver_id, encrypted, plain, translated, timestamp }
      const mapped = conv.map((m) => {
        // 2a) Odszyfrowujemy zaszyfrowany sygnał (tylko na potrzeby oryginału, do long-press)
        const decrypted = decryptSignal(JSON.parse(m.encrypted));

        // 2b) Priorytet: jeśli backend wygenerował `m.translated`, wyświetlamy go.
        // Jeśli nie, fallbackujemy na odszyfrowany oryginał.
        const displayedText = m.translated ?? decrypted;

        return {
          id: m.id,
          sender_id: m.sender_id,
          receiver_id: m.receiver_id,
          text: displayedText,    // To wyświetlamy w bąbelku
          isMine: m.sender_id === me.id,
          original: decrypted,     // Oryginał (do long-press)
          translated: m.translated, // Jeśli jest, to trzymamy
          timestamp: m.timestamp,
        };
      });
      setMsgs(mapped);
    } catch (err) {
      console.error('loadConversation error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [me, other.id]);

  // --- 3) Wywołujemy loadConversation po pobraniu „me” i co 3s odświeżamy ---
  useEffect(() => {
    loadConversation();
    const iv = setInterval(loadConversation, 3000);
    return () => clearInterval(iv);
  }, [loadConversation]);

  // --- 4) Funkcja wysyłająca wiadomość (plain + encrypted) ---
  const onSend = async () => {
    if (!me) return;                     // dopóki nie ma me, nie wysyłamy
    const txt = input.trim();
    if (!txt) return;                    // jeśli pusty tekst, nic nie róbemy

    setLoading(true);
    try {
      // 4a) Szyfrujemy do tablicy liczb
      const encryptedArray = encryptText(txt);
      // 4b) Upraszczamy w format JSON-string, wysyłamy plain + encrypted
      await sendMessage(other.id, encryptedArray, txt);
      // 4c) Dodajemy czat do listy aktywnych czatów (zakładka „Czaty”)
      addChat(other);
      setInput('');
      // 4d) Odświeżamy widok konwersacji
      await loadConversation();
    } catch (err) {
      console.error('onSend error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 5) Jeśli jeszcze nie pobraliśmy „me”, wyświetlamy spinner ---
  if (!me) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // --- 6) UI ekranu czatu ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Nagłówek z przyciskiem wstecz i nazwą użytkownika „other.username” */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{other.username}</Text>
        {/* Pusty widok, żeby centralny tytuł był na środku */}
        <View style={{ width: 40 }} />
      </View>

      {/* Lista bąbelków z wiadomościami */}
      <FlatList
        data={msgs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() =>
              // Long press: pokaż alert z oryginalnym tekstem
              Alert.alert('Oryginał wiadomości', item.original)
            }
            activeOpacity={0.8}
          >
            <MessageBubble text={item.text} isMine={item.isMine} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />

      {/* Spinner mały podczas ładowania */}
      {loading && <ActivityIndicator style={styles.loader} size="small" color="#007AFF" />}

      {/* Pole do wpisania nowej wiadomości */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Napisz wiadomość..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={onSend}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
          <Text style={styles.sendText}>Wyślij</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Ekran ładowania
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  // Główny kontener
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  // Nagłówek z przyciskiem wstecz
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',   // stonowany, lekko szary kolor
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // Lista bąbelków
  list: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  loader: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
  },
  // Kontener na pole tekstowe
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#007AFF',   // przycisk w niebieskim kolorze
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});