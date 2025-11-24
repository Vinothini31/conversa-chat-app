import dotenv from "dotenv";
dotenv.config();

console.log("DEBUG: .env GEMINI_API_KEY =", process.env.GEMINI_API_KEY);


import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => res.send("Conversa API is Running..."));

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
