import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(express.json());

// --- IMPORTANT: UPDATE CORS HERE ---
app.use(cors({
  origin: [
    "https://conversa-chat-app-2.onrender.com",   // your frontend URL
    "http://localhost:3000"                      // for local development
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => res.send("Conversa API is Running..."));

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
