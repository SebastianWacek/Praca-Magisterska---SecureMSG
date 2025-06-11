// LoginScreen.js
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert, Text } from "react-native";
import { login } from "../services/api";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!username || !password) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola");
      return;
    }
    setLoading(true);

    try {
      await login({ username, password });

      // Po pomyślnym loginie resetujemy stack i wchodzimy do MainTabs -> zakładka "Users"
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Main",
            params: { screen: "Users" },
          },
        ],
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Błąd logowania", err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logowanie</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa użytkownika"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title={loading ? "Proszę czekać..." : "Zaloguj"}
        onPress={onLogin}
        disabled={loading}
      />
      <Text style={styles.registerText} onPress={() => navigation.navigate("Register")}>
        Nie masz konta? Zarejestruj się
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  title: { fontSize: 24, marginBottom: 24, textAlign: "center" },
  registerText: { marginTop: 16, color: "#007AFF", textAlign: "center" },
});