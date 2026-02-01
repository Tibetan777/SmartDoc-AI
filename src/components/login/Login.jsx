import { useState } from "react";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegister ? "/api/register" : "/api/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        if (!isRegister) {
          localStorage.setItem("token", data.token);
          onLoginSuccess(data.user);
        } else {
          alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
          setIsRegister(false);
          setFormData({ name: "", email: "", password: "" }); // Clear form
        }
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-card">
        <h1>SmartDoc AI</h1>
        <p className="auth-subtitle">
          {isRegister ? "Create your workspace" : "Welcome back"}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            required
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            required
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            type="submit"
            disabled={loading}
            className={loading ? "loading-btn" : ""}
          >
            {loading ? "Processing..." : isRegister ? "Sign Up" : "Log In"}
          </button>
        </form>

        <button
          className="toggle-btn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Already have an account? Log In"
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
