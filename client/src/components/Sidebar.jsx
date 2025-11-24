import React from "react";
import "../styles/Sidebar.css";

const Sidebar = ({ chats = [], onSelectChat, onNewChat }) => {
  return (
    <div className="sidebar">

      <div className="sidebar-header">
        <h2>Conversa</h2>
        <button className="new-chat-btn" onClick={onNewChat}>+ New Chat</button>
      </div>

      <div className="chat-list">
        {chats.length === 0 && (
          <p className="empty">No chats yet</p>
        )}

        {chats.map(c => (
          <div
            key={c._id}
            className="chat-item"
            onClick={() => onSelectChat(c._id)}
          >
            <p>{c.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
