import axios from "axios";

const isProduction = process.env.NODE_ENV === "production";

const api = axios.create({
  baseURL: isProduction
    ? "https://conversa-chatapp.onrender.com/api"   // 🔵 Render backend
    : "http://localhost:5000/api",                 // 🟢 Local backend
});

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Get all chat history
export const getHistory = async () => {
  return api.get("/chat/history");
};

// Send a message to AI
export const sendMessage = async (message, chatId) => {
  return api.post("/chat/send", { message, chatId });
};

// Get a single chat by ID (for chat window)
export const getChatById = async (chatId) => {
  return api.get(`/chat/${chatId}`);
};

export default api;
