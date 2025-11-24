import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ChatPage from "./pages/Chat"; // this contains sidebar + chat window

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Pages */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Full Chat Interface (Sidebar + Chat Window) */}
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
