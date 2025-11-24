import express from "express";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* -----------------------------------------------------
   VERIFY TOKEN
------------------------------------------------------*/
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* -----------------------------------------------------
   SEND MESSAGE
------------------------------------------------------*/
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { chatId, message } = req.body;

    // Validate message
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ message: "Message required" });
    }

    /* ------------------ FIND OR CREATE CHAT ------------------ */
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: req.userId });
      if (!chat) return res.status(404).json({ message: "Chat not found" });
    } else {
      chat = new Chat({
        userId: req.userId,
        title: message.substring(0, 40),
        messages: []
      });
    }

    /* ------------------ ADD USER MESSAGE ------------------ */
    chat.messages.push({ role: "user", text: message });

    /* ------------------ BUILD HISTORY PROMPT ------------------ */
    const history = chat.messages
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");

    const prompt = `${history}\nAssistant:`;

    /* ------------------ GEMINI API ------------------ */
    const GEMINI_MODEL = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

    let aiResponse = "";

    try {
      const response = await axios.post(
        `${url}?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      aiResponse =
        response.data?.candidates?.[0]?.content?.parts
          ?.map(p => p?.text || "")
          .join(" ")
          .trim() || "I'm sorry, I couldn't generate a response.";
    } catch (err) {
      console.error("Gemini API error:", err.response?.data || err.message);
      aiResponse = "I'm having trouble responding right now.";
    }

    /* ------------------ ADD AI MESSAGE ------------------ */
    chat.messages.push({
      role: "assistant",
      text: aiResponse.trim()
    });

    /* ------------------ SAFETY CLEANUP ------------------
       (removes old corrupted messages with no `text`)
    ------------------------------------------------------*/
    chat.messages = chat.messages.filter(
      m => m.text && typeof m.text === "string"
    );

    /* ------------------ SAVE FINAL CHAT ------------------ */
    await chat.save();

    res.json({
      chatId: chat._id,
      reply: aiResponse,
      chat
    });

  } catch (err) {
    console.error("Chat send error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

/* -----------------------------------------------------
   GET CHAT HISTORY
------------------------------------------------------*/
router.get("/history", verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId })
      .select("_id title messages createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -----------------------------------------------------
   GET SINGLE CHAT
------------------------------------------------------*/
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
