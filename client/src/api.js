import axios from "axios";

const api = axios.create({
  baseURL: "https://conversa-chatapp.onrender.com/api",
});

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ----------------------
//  CHAT API FUNCTIONS
// ----------------------

// Get all chat history
export const getHistory = async () => {
  return api.get("/chat/history"); // GET /api/chat/history
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
