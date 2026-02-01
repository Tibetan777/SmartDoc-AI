import { useState } from "react";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          alert("ลงทะเบียนสำเร็จ");
          setIsRegister(false);
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="login-container">
      <div className="auth-card">
        <h1>SmartDoc AI</h1>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="ชื่อ"
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          )}
          <input
            type="email"
            placeholder="อีเมล"
            required
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            required
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button type="submit">
            {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </button>
        </form>
        <button
          className="toggle-btn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "มีบัญชีแล้ว? เข้าสู่ระบบ" : "สมัครสมาชิกใหม่"}
        </button>
      </div>
    </div>
  );
}
