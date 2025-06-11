// RegisterScreen.js

import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { register } from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  // domyślnie English
  const [language, setLanguage] = useState("en");
  const [loading, setLoading]   = useState(false);

  const onRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola");
      return;
    }
    setLoading(true);
    try {
      // frontendowy wybór języka tylko do alertu
      await register({ username, email, password });
      Alert.alert("Sukces", `Konto utworzone. Wybrany język: ${language}`);
      navigation.replace("Login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Błąd rejestracji", err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rejestracja</Text>

      <TextInput
        style={styles.input}
        placeholder="Nazwa użytkownika"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Hasło"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Wybierz język:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={language}
          onValueChange={setLanguage}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Polski" value="pl" />
          <Picker.Item label="Deutsch" value="de" />
          <Picker.Item label="Español" value="es" />
        </Picker>
      </View>

      <Button
        title={loading ? "Proszę czekać..." : "Zarejestruj"}
        onPress={onRegister}
        disabled={loading}
      />

      <Text
        style={styles.loginText}
        onPress={() => navigation.navigate("Login")}
      >
        Masz już konto? Zaloguj się
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    marginTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 24,
    backgroundColor: "#fff",
    height: Platform.OS === "ios" ? 160 : 150,
    overflow: "hidden",
  },
  picker: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  pickerItem: {
    height: 40,
    color: "#333",
  },
  loginText: {
    marginTop: 16,
    color: "#007AFF",
    textAlign: "center",
  },
});