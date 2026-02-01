import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
// import DocumentWorkspace from "./components/workspace/DocumentWorkspace"; // สร้างไฟล์นี้ในขั้นตอนถัดไป
import "./App.css";

// Placeholder สำหรับหน้า Workspace ที่ยังไม่ได้สร้าง
const DocumentWorkspace = () => (
  <div style={{ color: "white", padding: 20 }}>
    Document Workspace (Under Construction)
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return (
      <div
        className="loading-screen"
        style={{
          background: "#0f0f0f",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1A73E8",
        }}
      >
        <h2>Initialize SmartDoc AI...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Route สำหรับหน้า Login */}
        <Route
          path="/login"
          element={
            !user ? (
              <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Route หลักคือ Dashboard */}
        <Route
          path="/"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Route สำหรับเปิดดูเอกสารแต่ละไฟล์ */}
        <Route
          path="/file/:id"
          element={
            user ? <DocumentWorkspace user={user} /> : <Navigate to="/login" />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
