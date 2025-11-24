import React, { useState, useEffect, useRef } from "react";
import { getHistory, sendMessage } from "../api";
import "../styles/Chat.css";

export default function ChatPage() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef(null);

  // -------------------------------
  // LOAD CHAT LIST
  // -------------------------------
  useEffect(() => {
    const loadThreads = async () => {
      try {
        const res = await getHistory();
        setThreads(res.data || []);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadThreads();
  }, []);

  // -------------------------------
  // LOAD MESSAGES WHEN SELECTED THREAD CHANGES
  // -------------------------------
  useEffect(() => {
    if (!selectedThread) return;

    const loadMessages = async () => {
      if (selectedThread._id.startsWith("tmp-")) {
        setMessages(selectedThread.messages || []);
        return;
      }

      try {
        const res = await fetch(`/api/chat/${selectedThread._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages(selectedThread.messages || []);
      }
    };

    loadMessages();
    setSidebarOpen(false);
  }, [selectedThread]);

  // -------------------------------
  // SCROLL TO BOTTOM
  // -------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -------------------------------
  // CREATE NEW CHAT
  // -------------------------------
  const handleNewChat = () => {
    const newChat = {
      _id: "tmp-" + Date.now(),
      title: "New Chat",
      messages: [],
    };

    setThreads((prev) => [...prev, newChat]);
    setSelectedThread(newChat);
    setMessages([]);
  };

  // -------------------------------
  // SEND MESSAGE
  // -------------------------------
  const handleSend = async () => {
    if (!input.trim()) return;

    // Auto-create new chat if none is selected
    if (!selectedThread) {
      const newChat = {
        _id: "tmp-" + Date.now(),
        title: "New Chat",
        messages: [],
      };

      setThreads((prev) => [...prev, newChat]);
      setSelectedThread(newChat);
      setMessages([]);

      return;
    }

    const chatId = selectedThread._id.startsWith("tmp-")
      ? undefined
      : selectedThread._id;

    const userMsg = { role: "user", text: input };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage(input, chatId);

      const botMsg = {
        role: "assistant",
        text: res.data.reply || "No response received",
      };

      setMessages((prev) => [...prev, botMsg]);

      // Update thread messages locally
      setThreads((prev) =>
        prev.map((t) =>
          t._id === selectedThread._id || t._id === chatId
            ? {
                ...t,
                messages: [...(t.messages || []), userMsg, botMsg],
              }
            : t
        )
      );

      // ⭐ FINAL FIX — NO BLINK, NO FLICKER
      if (selectedThread._id.startsWith("tmp-") && res.data.chatId) {
        const newId = res.data.chatId;

        // 1) Update threads
        setThreads((prev) =>
          prev.map((t) =>
            t._id === selectedThread._id ? { ...t, _id: newId } : t
          )
        );

        // 2) Update selectedThread WITHOUT remounting
        setSelectedThread((prev) => ({
          ...prev,
          _id: newId, // Same object → no flicker
        }));
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "🤔 AI is thinking… try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleSend();
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="chat-layout">

      {/* HAMBURGER */}
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>
        ☰
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Chat History</h2>
          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="chat-history">
          {threads.length === 0 && <p>No chats yet</p>}

          {threads.map((t) => (
            <div
              key={t._id}
              className={`chat-thread ${
                selectedThread?._id === t._id ? "active" : ""
              }`}
              onClick={() => setSelectedThread(t)}
            >
              {t.title || "Untitled Chat"}
            </div>
          ))}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CHAT WINDOW */}
      <main className="chat-window">
        <button className="floating-new-chat" onClick={handleNewChat}>
          + New Chat
        </button>

        {selectedThread ? (
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>
                <p>{msg.text}</p>
              </div>
            ))}

            {loading && (
              <div className="msg assistant">
                <p>🤖 Thinking...</p>
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>
        ) : (
          <div className="empty-screen">Hello! Ask me anything…</div>
        )}

        {/* INPUT BAR */}
        <div className="input-bar">
          <input
            type="text"
            value={input}
            placeholder="Send a message..."
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend} disabled={loading}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
