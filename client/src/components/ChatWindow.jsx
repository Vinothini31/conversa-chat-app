import React, { useEffect, useState, useRef } from "react";
import { sendMessage, getChatById } from "../api";

function ChatWindow({ threadId, setThreadId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // Load chat when threadId changes
  useEffect(() => {
    if (!threadId) return;

    getChatById(threadId)
      .then((res) => {
        setMessages(res.data.chat?.messages || []);
      })
      .catch((err) => console.error("Failed to load chat:", err));
  }, [threadId]);

  // Auto scroll to last message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const res = await sendMessage(input.trim(), threadId);

      /**
       * Backend returns:
       * {
       *   chatId: "...",
       *   chat: { messages: [...] }
       * }
       */

      // If it is a new chat → update threadId
      if (!threadId) {
        setThreadId(res.data.chatId);
      }

      // Update messages from backend
      setMessages(res.data.chat.messages);

      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Chat Messages Box */}
      <div
        style={{
          height: "75vh",
          overflowY: "auto",
          padding: "10px",
          border: "1px solid gray",
          borderRadius: "10px",
          marginBottom: 10,
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "10px 0" }}>
            <strong
              style={{
                color: msg.role === "user" ? "#ff8f45" : "#4da6ff",
              }}
            >
              {msg.role === "user" ? "You" : "AI"}
            </strong>
            <p style={{ margin: 0 }}>{msg.text}</p>
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      {/* Input + Send */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #aaa",
            borderRadius: 8,
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />

        <button
          onClick={handleSend}
          style={{
            padding: "10px 20px",
            background: "#ff914d",
            border: "none",
            borderRadius: 8,
            color: "#fff",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
