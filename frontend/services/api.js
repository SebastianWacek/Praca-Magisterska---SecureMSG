// Api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config"; // np. "http://192.168.0.10:8000" lub inny adres backendu

const client = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// INTERCEPTOR: zawsze dołączamy token JWT ("Bearer <token>") do nagłówka
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  console.log("Axios interceptor, token z AsyncStorage:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- Auth -----
export const register = ({ username, email, password }) =>
  client.post("/auth/register", { username, email, password }).then((r) => r.data);

export const login = async ({ username, password }) => {
  console.log("Wysyłam POST /auth/login ->", API_URL + "/auth/login"); // << dodaj ten log, żeby zobaczyć, czy URL jest ok
  const res = await client.post("/auth/login", { username, password });
  console.log("login() - odpowiedź klienta:", res.data);                // << dodaj ten log
  const { access_token } = res.data;
  await AsyncStorage.setItem("token", access_token);
  console.log("login() - zapisany token w AsyncStorage:", access_token);
  return res.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};

// ----- Użytkownicy -----
export const fetchUsers = () =>
  client.get("/users").then((r) => r.data);

export const getCurrentUser = () =>
  client.get("/users/me").then((r) => r.data);

// ----- Wiadomości -----
export const sendMessage = (receiverId, encryptedArray, plainText) => {
  return client
    .post("/messages", {
      receiver_id: receiverId,
      encrypted: JSON.stringify(encryptedArray),
      plain: plainText,
    })
    .then((r) => r.data);
};

export const fetchConversation = (otherUserId) =>
  client.get(`/messages/${otherUserId}`).then((r) => r.data);